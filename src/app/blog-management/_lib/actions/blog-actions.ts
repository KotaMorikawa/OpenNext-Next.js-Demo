"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-server";

// useActionState用の状態型
export type BlogFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  data?: {
    id: string;
    title: string;
    published: boolean;
  };
  timestamp: number;
};

// バリデーションスキーマ
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(255, "タイトルは255文字以内です"),
  content: z.string().min(1, "内容は必須です"),
  excerpt: z.string().max(500, "抜粋は500文字以内です").optional(),
  categoryId: z
    .string()
    .uuid({ message: "有効なUUIDを入力してください" })
    .optional(),
  tagIds: z
    .array(z.string().uuid({ message: "有効なUUIDを入力してください" }))
    .optional(),
  published: z.boolean().default(false),
});

const updatePostSchema = createPostSchema.extend({
  id: z.string().uuid({ message: "有効なUUIDを入力してください" }),
});

// 共通ヘルパー関数
async function makePostRequest(
  url: string,
  method: string,
  data: unknown,
): Promise<Response> {
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function handlePostResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 404) {
      throw new Error("投稿が見つかりません");
    }
    if (response.status === 403) {
      throw new Error("この投稿を編集する権限がありません");
    }
    throw new Error(errorData.error || "操作に失敗しました");
  }
  return response.json();
}

function parseFormData(
  formData: FormData,
  includeId: false,
): z.infer<typeof createPostSchema>;
function parseFormData(
  formData: FormData,
  includeId: true,
): z.infer<typeof updatePostSchema>;
function parseFormData(formData: FormData, includeId = false) {
  const categoryId = formData.get("categoryId")?.toString();

  const rawData = {
    ...(includeId && { id: formData.get("id")?.toString() || "" }),
    title: formData.get("title")?.toString() || "",
    content: formData.get("content")?.toString() || "",
    excerpt: formData.get("excerpt")?.toString() || "",
    categoryId: !categoryId || categoryId === "" ? undefined : categoryId,
    tagIds: formData.getAll("tagIds").filter((id) => id) as string[],
    published: formData.get("published") === "on",
  };

  return includeId
    ? (updatePostSchema.parse(rawData) as z.infer<typeof updatePostSchema>)
    : (createPostSchema.parse(rawData) as z.infer<typeof createPostSchema>);
}

function handleValidationError(error: unknown): never {
  if (error instanceof z.ZodError) {
    throw new Error(
      `バリデーションエラー: ${error.issues.map((e) => e.message).join(", ")}`,
    );
  }
  throw error as Error;
}

function createErrorState(
  error: unknown,
  defaultMessage: string,
): BlogFormState {
  if (error instanceof z.ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of error.issues) {
      if (issue.path.length > 0) {
        errors[issue.path[0] as string] = issue.message;
      }
    }
    return {
      success: false,
      message: "入力内容に不備があります",
      errors,
      timestamp: Date.now(),
    };
  }

  return {
    success: false,
    message: error instanceof Error ? error.message : defaultMessage,
    timestamp: Date.now(),
  };
}

// 投稿作成Action
export async function createPost(formData: FormData) {
  let shouldRedirect = false;
  let redirectPath = "";

  try {
    await requireAuth();
    const validatedData = parseFormData(formData, false);

    const response = await makePostRequest(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts`,
      "POST",
      validatedData,
    );

    const newPost = (await handlePostResponse(response)) as { id: string };

    revalidatePath("/blog-management");
    revalidateTag("posts");

    shouldRedirect = true;
    redirectPath = validatedData.published
      ? `/blog-management/${newPost.id}`
      : "/blog-management";
  } catch (error) {
    console.error("投稿作成エラー:", error);
    handleValidationError(error);
  }

  if (shouldRedirect && redirectPath !== "") {
    redirect(redirectPath);
  }
}

// 投稿更新Action
export async function updatePost(formData: FormData) {
  let shouldRedirect = false;
  let redirectPath = "";

  try {
    await requireAuth();
    const validatedData = parseFormData(formData, true);

    const response = await makePostRequest(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts`,
      "PUT",
      validatedData,
    );

    await handlePostResponse(response);

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${validatedData.id}`);
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    shouldRedirect = true;
    redirectPath = `/blog-management/${validatedData.id}`;
  } catch (error) {
    console.error("投稿更新エラー:", error);
    handleValidationError(error);
  }

  if (shouldRedirect && redirectPath !== "") {
    redirect(redirectPath);
  }
}

// 投稿削除Action
export async function deletePost(formData: FormData) {
  let shouldRedirect = false;

  try {
    await requireAuth();

    const postId = formData.get("id")?.toString();
    if (!postId) {
      throw new Error("投稿IDが指定されていません");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts?id=${postId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    await handlePostResponse(response);

    revalidatePath("/blog-management");
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    shouldRedirect = true;
  } catch (error) {
    console.error("投稿削除エラー:", error);
    throw error;
  }

  if (shouldRedirect) {
    redirect("/blog-management");
  }
}

// 投稿の公開/非公開切り替えAction
export async function togglePostPublished(formData: FormData) {
  try {
    await requireAuth();

    const postId = formData.get("id")?.toString();
    const published = formData.get("published") === "true";

    if (!postId) {
      throw new Error("投稿IDが指定されていません");
    }

    const response = await makePostRequest(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts`,
      "PATCH",
      { id: postId, published },
    );

    await handlePostResponse(response);

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${postId}`);
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    return { success: true };
  } catch (error) {
    console.error("公開状態切り替えエラー:", error);
    throw error;
  }
}

// ============================================================================
// useActionState対応のServer Actions
// ============================================================================

// useActionState用の投稿作成Action
export async function createPostWithState(
  _prevState: BlogFormState | null,
  formData: FormData,
): Promise<BlogFormState> {
  let shouldRedirect = false;
  let redirectPath = "";

  try {
    await requireAuth();
    const validatedData = parseFormData(formData, false);

    const response = await makePostRequest(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts`,
      "POST",
      validatedData,
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.error || "投稿の作成に失敗しました",
        timestamp: Date.now(),
      };
    }

    const newPost = (await response.json()) as { id: string };

    revalidatePath("/blog-management");
    revalidateTag("posts");

    shouldRedirect = true;
    redirectPath = validatedData.published
      ? `/blog-management/${newPost.id}`
      : "/blog-management";
  } catch (error) {
    console.error("投稿作成エラー:", error);
    return createErrorState(error, "投稿の作成に失敗しました");
  }

  if (shouldRedirect && redirectPath !== "") {
    redirect(redirectPath);
  }

  return {
    success: false,
    message: "予期しないエラー",
    timestamp: Date.now(),
  };
}

// useActionState用の投稿更新Action
export async function updatePostWithState(
  _prevState: BlogFormState | null,
  formData: FormData,
): Promise<BlogFormState> {
  let shouldRedirect = false;
  let redirectPath = "";

  try {
    await requireAuth();
    const validatedData = parseFormData(formData, true);

    const response = await makePostRequest(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts`,
      "PUT",
      validatedData,
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        return {
          success: false,
          message: "投稿が見つかりません",
          timestamp: Date.now(),
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          message: "この投稿を編集する権限がありません",
          timestamp: Date.now(),
        };
      }
      return {
        success: false,
        message: errorData.error || "投稿の更新に失敗しました",
        timestamp: Date.now(),
      };
    }

    revalidatePath("/blog-management");
    revalidatePath(`/blog-management/${validatedData.id}`);
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    shouldRedirect = true;
    redirectPath = `/blog-management/${validatedData.id}`;
  } catch (error) {
    console.error("投稿更新エラー:", error);
    return createErrorState(error, "投稿の更新に失敗しました");
  }

  if (shouldRedirect && redirectPath !== "") {
    redirect(redirectPath);
  }

  return { success: false, message: "予期しないエラー", timestamp: Date.now() };
}

// useActionState用の投稿削除Action
export async function deletePostWithState(
  _prevState: BlogFormState | null,
  formData: FormData,
): Promise<BlogFormState> {
  try {
    await requireAuth();

    const postId = formData.get("id")?.toString();
    if (!postId) {
      return {
        success: false,
        message: "投稿IDが指定されていません",
        timestamp: Date.now(),
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/posts?id=${postId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 404) {
        return {
          success: false,
          message: "投稿が見つかりません",
          timestamp: Date.now(),
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          message: "この投稿を削除する権限がありません",
          timestamp: Date.now(),
        };
      }
      return {
        success: false,
        message: errorData.error || "投稿の削除に失敗しました",
        timestamp: Date.now(),
      };
    }

    revalidatePath("/blog-management");
    revalidateTag("posts");
    revalidateTag("posts-metadata");

    redirect("/blog-management");
  } catch (error) {
    console.error("投稿削除エラー:", error);
    return createErrorState(error, "投稿の削除に失敗しました");
  }
}

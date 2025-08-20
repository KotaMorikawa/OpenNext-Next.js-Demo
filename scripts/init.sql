-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Example tables for Next.js v15 feature testing
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO users (email, name) VALUES 
    ('admin@example.com', 'Admin User'),
    ('user@example.com', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Get admin user id for posts
INSERT INTO posts (title, content, slug, published, author_id) 
SELECT 
    'Hello Next.js v15',
    'This is a sample post for testing Next.js v15 features including Server Components, caching, and more.',
    'hello-nextjs-v15',
    true,
    u.id
FROM users u WHERE u.email = 'admin@example.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO posts (title, content, slug, published, author_id) 
SELECT 
    'Server Components Guide',
    'Learn how to use React Server Components with Next.js v15.',
    'server-components-guide',
    true,
    u.id
FROM users u WHERE u.email = 'admin@example.com'
ON CONFLICT (slug) DO NOTHING;
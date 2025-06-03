-- Ensure you have the pgvector extension enabled in Supabase.
-- This function is designed to work with Langchain's SupabaseVectorStore.
-- It assumes your table is named 'cake_knowledge_embeddings' and has columns:
-- id (e.g., bigint, serial, or uuid)
-- content (text)
-- metadata (jsonb)
-- embedding (vector(768)) - Adjust dimension if your model (nomic-embed-text) differs.

CREATE OR REPLACE FUNCTION match_cake_knowledge (
  query_embedding vector(768), -- Dimension for nomic-embed-text is typically 768
  match_count int,
  filter jsonb DEFAULT '{}'::jsonb -- Default to an empty JSONB object if no filter is provided
)
RETURNS TABLE (
  id bigint, -- Adjust type if your 'id' column is different (e.g., uuid)
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cke.id,
    cke.content,
    cke.metadata,
    1 - (cke.embedding <=> query_embedding) AS similarity -- Cosine similarity
  FROM
    public.cake_knowledge_embeddings AS cke
  WHERE
    -- Apply metadata filter if provided and not empty
    -- This checks if the 'metadata' column in the table contains the 'filter' JSONB.
    -- For example, if filter is '{"source": "document-1"}',
    -- it will match rows where metadata includes {"source": "document-1"}.
    CASE
      WHEN filter IS NOT NULL AND jsonb_typeof(filter) = 'object' AND filter != '{}'::jsonb THEN
        cke.metadata @> filter
      ELSE
        TRUE -- No filter or empty filter, so match all
    END
  ORDER BY
    cke.embedding <=> query_embedding -- Orders by distance (ascending)
  LIMIT
    match_count;
END;
$$;

-- Additionally, your rag-setup.ts tries to call a function 'create_cake_knowledge_table'.
-- You'll need a function like this if the table might not exist.
-- Here's an example, assuming 'nomic-embed-text' uses dimension 768.
-- Make sure this matches your actual requirements for the table structure.

-- CREATE OR REPLACE FUNCTION create_cake_knowledge_table()
-- RETURNS void
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   CREATE TABLE IF NOT EXISTS public.cake_knowledge_embeddings (
--     id bigserial primary key,
--     content text,
--     metadata jsonb,
--     embedding vector(768) -- Ensure dimension matches your embedding model
--   );
-- END;
-- $$;

-- After creating the function(s) above using the Supabase SQL editor,
-- you might also need to ensure your 'cake_knowledge_embeddings' table exists
-- and has the correct schema (id, content, metadata, embedding vector(768)).
-- If you uncomment and run the 'create_cake_knowledge_table' function,
-- you can then call it from your application if needed, or run it once manually.
-- Example call: SELECT create_cake_knowledge_table();

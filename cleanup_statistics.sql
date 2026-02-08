-- SQL Script to Clean Up Duplicate Statistics
-- This removes duplicate statistics records, keeping only one per article

-- Step 1: See how many duplicates exist
SELECT article_id, COUNT(*) as count
FROM statistics
GROUP BY article_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Step 2: Delete duplicates, keeping only the oldest record for each article
DELETE FROM statistics
WHERE id NOT IN (
    SELECT MIN(id)
    FROM statistics
    GROUP BY article_id
);

-- Step 3: Verify the cleanup
SELECT COUNT(*) as total_statistics FROM statistics;
SELECT COUNT(DISTINCT article_id) as unique_articles FROM statistics;

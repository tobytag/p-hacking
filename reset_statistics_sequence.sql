-- SQL Script to Reset Statistics ID Sequence
-- This resets the auto-increment sequence to continue from the current max ID

-- Reset the sequence to the current maximum ID + 1
SELECT setval('statistics_id_seq', (SELECT COALESCE(MAX(id), 1) FROM statistics));

-- Verify the sequence is reset correctly
SELECT currval('statistics_id_seq') as current_sequence_value;
SELECT MAX(id) as max_id_in_table FROM statistics;

/*
# Add explanation column + seed AI Fundamentals course with real questions

## Changes
1. Adds `explanation` text column to `lesson_questions` for post-answer feedback.
2. Creates skill "AI & AI Tools" and course "AI Fundamentals" (Beginner, published).
3. Creates 3 sections with 3 lessons each (9 lessons total).
4. Creates 5 questions per lesson (45 total), each with 3-4 options, one correct answer, and a useful explanation.

## Security
- No RLS changes — new column inherits existing table policies.
- New content follows the same published-content visibility rules.
*/

-- Add explanation column
ALTER TABLE lesson_questions ADD COLUMN IF NOT EXISTS explanation text;

-- New skill
INSERT INTO skills (id, name, description, icon) VALUES
  ('a0000000-0000-0000-0000-000000000005', 'AI & AI Tools',
   'Understand artificial intelligence fundamentals and practical AI tooling', 'Cpu')
ON CONFLICT (id) DO NOTHING;

-- New course
INSERT INTO courses (id, skill_id, title, description, level, published) VALUES
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005',
   'AI Fundamentals',
   'Build a solid foundation in artificial intelligence — from core concepts to practical tools.',
   'Beginner', true)
ON CONFLICT (id) DO NOTHING;

-- 3 Sections
INSERT INTO course_sections (id, course_id, title, description, position) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
   'What is AI?', 'Core concepts and terminology', 0),
  ('c1000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003',
   'How AI Learns', 'Training, data, and models', 1),
  ('c1000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003',
   'AI in Practice', 'Real-world tools and applications', 2)
ON CONFLICT (id) DO NOTHING;

-- 9 Lessons
INSERT INTO lessons (id, section_id, title, description, position, xp_reward, gem_reward, published) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'Defining Artificial Intelligence', 'Learn what AI actually means and how it differs from traditional programming.', 0, 20, 2, true),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
   'Types of AI Systems', 'Explore narrow AI, general AI, and the distinctions between them.', 1, 25, 3, true),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001',
   'AI vs Traditional Software', 'Understand the fundamental shift from rule-based to learning-based systems.', 2, 25, 3, true),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002',
   'Data: The Fuel for AI', 'Learn why data is foundational to every AI system.', 0, 30, 3, true),
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002',
   'Training and Models', 'Understand how models are trained and what they actually learn.', 1, 30, 4, true),
  ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002',
   'Machine Learning vs Deep Learning', 'Distinguish between ML, DL, and where each applies.', 2, 35, 4, true),
  ('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003',
   'Large Language Models', 'Understand how LLMs like GPT work at a beginner level.', 0, 35, 5, true),
  ('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003',
   'Prompt Engineering Basics', 'Learn how to communicate effectively with AI tools.', 1, 35, 5, true),
  ('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000003',
   'AI Ethics and Limitations', 'Understand bias, hallucinations, and responsible AI use.', 2, 40, 6, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- QUESTIONS + OPTIONS (using DO blocks for UUID generation)
-- ============================================================

-- Lesson 1: Defining Artificial Intelligence
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Which best describes artificial intelligence?', 'multiple_choice', 0,
     'AI is about building systems that can perform tasks that typically require human intelligence — such as recognizing patterns, making decisions, or understanding language. It does not require consciousness or human-like reasoning.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'A system that can perform tasks requiring human-like intelligence', true, 0),
    (q, 'A robot with a physical body', false, 1),
    (q, 'Any computer program that uses math', false, 2),
    (q, 'A system that is conscious and self-aware', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'What is the key difference between AI and a traditional calculator?', 'multiple_choice', 1,
     'A calculator follows fixed, pre-programmed rules. AI systems can learn patterns from data and improve their performance over time without being explicitly reprogrammed for every scenario.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'AI can learn from data and improve without being reprogrammed for every case', true, 0),
    (q, 'AI can perform calculations faster', false, 1),
    (q, 'AI uses more electricity', false, 2),
    (q, 'AI always produces correct results', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Which of these is an example of AI in everyday life?', 'multiple_choice', 2,
     'Email spam filters use AI to learn from patterns in email content and user behavior, improving over time. A simple keyword filter would be traditional software, not AI.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'An email spam filter that learns from your behavior', true, 0),
    (q, 'A basic calculator app on your phone', false, 1),
    (q, 'A digital clock that shows the time', false, 2),
    (q, 'A spreadsheet that sums a column', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'Artificial intelligence designed for a specific task (like playing chess) is called:', 'multiple_choice', 3,
     'Narrow AI (or weak AI) is designed for one specific task. General AI (AGI) would match human-level intelligence across all domains — and does not yet exist.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Narrow AI', true, 0),
    (q, 'General AI (AGI)', false, 1),
    (q, 'Super AI', false, 2),
    (q, 'Artificial emotion', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'True or False: AI systems must be programmed with explicit rules for every possible scenario.', 'true_false', 4,
     'This is false. Unlike traditional software, AI systems learn from data and can generalize to scenarios they were not explicitly programmed for.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'False — AI learns from data and generalizes', true, 0),
    (q, 'True — AI needs explicit rules for everything', false, 1);
END $$;

-- Lesson 2: Types of AI Systems
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000002', 'What is Artificial General Intelligence (AGI)?', 'multiple_choice', 0,
     'AGI refers to a hypothetical AI that can understand, learn, and apply intelligence across any domain at a human level. No AGI system exists today — all current AI is narrow.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'AI that matches human intelligence across all domains', true, 0),
    (q, 'AI that only plays video games', false, 1),
    (q, 'AI that controls robots in factories', false, 2),
    (q, 'AI that runs on quantum computers', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000002', 'Which type of AI exists today?', 'multiple_choice', 1,
     'Only narrow AI exists today. Every AI system — from ChatGPT to self-driving cars — is designed for a specific domain. AGI and superintelligence remain theoretical.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Narrow AI — designed for specific tasks', true, 0),
    (q, 'General AI — human-level in all domains', false, 1),
    (q, 'Super AI — beyond human intelligence', false, 2),
    (q, 'Emotional AI — feels and understands emotions', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000002', 'A chess-playing AI is an example of:', 'multiple_choice', 2,
     'A chess AI is narrow AI — it excels at one specific task but cannot drive a car or write an essay. Being "better than humans" at one task does not make it general AI.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Narrow AI — specialized for one task', true, 0),
    (q, 'General AI — can do anything a human can', false, 1),
    (q, 'Super AI — smarter than all humans', false, 2),
    (q, 'It is not AI at all', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000002', 'What distinguishes "super AI" from AGI?', 'multiple_choice', 3,
     'Super AI (ASI) would surpass human intelligence in every domain, including creativity and social skills. AGI merely matches human-level intelligence. Neither exists yet.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Super AI surpasses human intelligence in every domain', true, 0),
    (q, 'Super AI is slower than AGI', false, 1),
    (q, 'Super AI requires less data than AGI', false, 2),
    (q, 'There is no difference', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000002', 'True or False: ChatGPT is an example of General AI.', 'true_false', 4,
     'False. ChatGPT is a narrow AI trained for language tasks. It may seem general because language is broad, but it cannot truly reason, plan, or learn new skills the way a human can.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'False — ChatGPT is narrow AI for language tasks', true, 0),
    (q, 'True — ChatGPT can do anything a human can', false, 1);
END $$;

-- Lesson 3: AI vs Traditional Software
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000003', 'In traditional software, behavior is determined by:', 'multiple_choice', 0,
     'Traditional software uses explicit rules written by programmers: "if X, then Y." AI instead learns patterns from data and infers the rules itself.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Explicit rules written by programmers', true, 0),
    (q, 'Patterns learned from data', false, 1),
    (q, 'Random number generation', false, 2),
    (q, 'User preferences stored in cookies', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000003', 'In AI systems, behavior is primarily determined by:', 'multiple_choice', 1,
     'AI systems learn from training data. The model discovers patterns in the data rather than following pre-written rules. The quality and quantity of data directly shapes behavior.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Patterns learned from training data', true, 0),
    (q, 'Rules written by a programmer', false, 1),
    (q, 'The system hardware', false, 2),
    (q, 'The programming language used', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000003', 'Which approach is better for recognizing images of cats?', 'multiple_choice', 2,
     'Image recognition is extremely hard to do with explicit rules (there are infinite ways a cat can look). AI learns visual patterns from thousands of example images, making it far more effective.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'AI — it learns visual patterns from examples', true, 0),
    (q, 'Traditional rules — write rules for every cat shape', false, 1),
    (q, 'Neither — it is impossible', false, 2),
    (q, 'Both work equally well', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000003', 'A key advantage of AI over traditional software is:', 'multiple_choice', 3,
     'AI can handle messy, ambiguous, real-world data that is impossible to capture with fixed rules. This is why AI powers spam filtering, voice recognition, and recommendation systems.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Handling ambiguous, real-world data', true, 0),
    (q, 'Running faster on the same hardware', false, 1),
    (q, 'Using less memory', false, 2),
    (q, 'Being easier to debug', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000003', 'True or False: AI systems can be 100% deterministic like traditional software.', 'true_false', 4,
     'False. AI systems are probabilistic — they produce the most likely answer, not a guaranteed one. This is why AI can make mistakes even when well-trained.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'False — AI is probabilistic, not deterministic', true, 0),
    (q, 'True — AI always gives the same output', false, 1);
END $$;

-- Lesson 4: Data: The Fuel for AI
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000004', 'Why is data often called "the fuel" for AI?', 'multiple_choice', 0,
     'Without data, AI has nothing to learn from. Just as an engine needs fuel, an AI model needs data to discover patterns. More relevant, high-quality data leads to better models.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Because AI models learn patterns from data — without data, there is nothing to learn', true, 0),
    (q, 'Because data powers the computer hardware', false, 1),
    (q, 'Because data cools the servers', false, 2),
    (q, 'Because data is expensive to buy', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000004', 'What is "training data"?', 'multiple_choice', 1,
     'Training data is the dataset used to teach an AI model. The model adjusts its internal parameters by looking at examples in this data, learning to map inputs to correct outputs.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'The dataset used to teach the model by example', true, 0),
    (q, 'The code that runs the AI system', false, 1),
    (q, 'The output the AI produces', false, 2),
    (q, 'The hardware the AI runs on', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000004', 'Which is more important for AI performance?', 'multiple_choice', 2,
     'Quality matters more than quantity. A large dataset of biased or incorrect data will produce a poor model. Clean, representative, well-labeled data is the foundation of good AI.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Quality — clean, representative data produces better models', true, 0),
    (q, 'Quantity — more data is always better', false, 1),
    (q, 'Speed — how fast the data is processed', false, 2),
    (q, 'Size — larger files make better models', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000004', 'What happens when an AI model is trained on biased data?', 'multiple_choice', 3,
     'AI learns from the patterns in its training data. If that data contains biases (e.g., historical discrimination), the model will reproduce and even amplify those biases in its predictions.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'The model reproduces and amplifies those biases', true, 0),
    (q, 'The model automatically corrects for the bias', false, 1),
    (q, 'The model ignores the biased data entirely', false, 2),
    (q, 'The model crashes during training', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000004', 'True or False: More data always results in a better AI model.', 'true_false', 4,
     'False. If the additional data is noisy, irrelevant, or biased, it can actually degrade performance. Quality and relevance matter as much as — or more than — sheer volume.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'False — quality and relevance matter as much as volume', true, 0),
    (q, 'True — more data is always better', false, 1);
END $$;

-- Lesson 5: Training and Models
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000005', 'What is a "model" in AI?', 'multiple_choice', 0,
     'A model is the result of training — it contains the patterns the AI learned from data. You can think of it as a mathematical function that takes inputs and produces predictions.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'A mathematical representation of patterns learned from data', true, 0),
    (q, 'The physical computer that runs the AI', false, 1),
    (q, 'The programming language used to write AI code', false, 2),
    (q, 'A database that stores training examples', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000005', 'What happens during the "training" process?', 'multiple_choice', 1,
     'During training, the model looks at examples and adjusts its internal parameters to minimize errors. Over many iterations, it learns to map inputs to correct outputs — this is the learning part of machine learning.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'The model adjusts its parameters by learning from examples', true, 0),
    (q, 'The model is manually programmed with rules', false, 1),
    (q, 'The model copies answers from the internet', false, 2),
    (q, 'The model is given the answers directly', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000005', 'What is "inference" in AI?', 'multiple_choice', 2,
     'Inference is when you use a trained model to make predictions on new, unseen data. Training builds the model; inference uses it. ChatGPT generating a response is inference.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Using a trained model to make predictions on new data', true, 0),
    (q, 'The process of collecting training data', false, 1),
    (q, 'Writing the code for an AI application', false, 2),
    (q, 'Testing whether the AI is conscious', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000005', 'Why do we split data into training and testing sets?', 'multiple_choice', 3,
     'If you test on the same data you trained on, the model might just memorize it. A separate test set shows whether the model actually learned general patterns or just memorized — this is called generalization.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'To check if the model generalizes rather than memorizes', true, 0),
    (q, 'To make the training process faster', false, 1),
    (q, 'To reduce the amount of data needed', false, 2),
    (q, 'Because it is required by law', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000005', 'True or False: A model trained on cat photos can immediately recognize dogs.', 'true_false', 4,
     'False. The model learned patterns specific to cats from its training data. To recognize dogs, it would need to be trained on dog photos as well, or on a broader dataset of animals.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'False — it would need dog photos in its training data', true, 0),
    (q, 'True — AI models can recognize any animal', false, 1);
END $$;

-- Lesson 6: Machine Learning vs Deep Learning
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000006', 'What is the relationship between AI, ML, and DL?', 'multiple_choice', 0,
     'AI is the broadest field. Machine learning (ML) is a subset of AI that learns from data. Deep learning (DL) is a subset of ML that uses neural networks with many layers — hence "deep."')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'AI is the broadest field, ML is a subset, DL is a subset of ML', true, 0),
    (q, 'They are three names for the same thing', false, 1),
    (q, 'ML is the broadest, AI is a subset, DL is separate', false, 2),
    (q, 'DL is the broadest, ML is a subset, AI is a subset of ML', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000006', 'What is a neural network?', 'multiple_choice', 1,
     'A neural network is a model inspired by the brain, with layers of interconnected "neurons" that process information. Each connection has a weight that is learned during training.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'A model with layers of interconnected units inspired by the brain', true, 0),
    (q, 'A network of physical computers connected to the internet', false, 1),
    (q, 'A database schema for storing AI training data', false, 2),
    (q, 'A type of programming language for AI', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000006', 'Why is it called "deep" learning?', 'multiple_choice', 2,
     '"Deep" refers to the number of layers in the neural network. A network with many layers between input and output is "deep." More layers allow the model to learn more complex, hierarchical patterns.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Because it uses many layers of neurons', true, 0),
    (q, 'Because it requires deep knowledge to use', false, 1),
    (q, 'Because it processes data in deep files', false, 2),
    (q, 'Because it was developed by DeepMind', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000006', 'Which type of AI is best for image recognition?', 'multiple_choice', 3,
     'Deep learning excels at image recognition because its multiple layers can learn hierarchical features — from simple edges in early layers to complex objects in deeper layers. Traditional ML requires manual feature engineering.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Deep learning — it learns hierarchical features automatically', true, 0),
    (q, 'Traditional ML with manual feature engineering', false, 1),
    (q, 'A simple if-else rule system', false, 2),
    (q, 'A relational database', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000006', 'True or False: Deep learning is a subset of machine learning.', 'true_false', 4,
     'True. Deep learning is a specialized form of ML that uses deep neural networks. All deep learning is ML, but not all ML is deep learning — ML also includes simpler methods like decision trees and linear regression.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'True — DL is a specialized form of ML using neural networks', true, 0),
    (q, 'False — DL and ML are completely different fields', false, 1);
END $$;

-- Lesson 7: Large Language Models
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000007', 'What is a Large Language Model (LLM)?', 'multiple_choice', 0,
     'An LLM is an AI model trained on massive amounts of text data to understand and generate human language. It learns statistical patterns in language — which words tend to follow which — enabling it to predict and generate text.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'An AI model trained on massive text data to understand and generate language', true, 0),
    (q, 'A large database of dictionary definitions', false, 1),
    (q, 'A spell-check tool for word processors', false, 2),
    (q, 'A search engine that indexes web pages', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000007', 'How does an LLM generate text?', 'multiple_choice', 1,
     'An LLM generates text one token at a time, predicting the most likely next token based on the preceding text. It does not "understand" meaning the way humans do — it uses statistical patterns learned from training data.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'By predicting the most likely next token based on preceding text', true, 0),
    (q, 'By looking up answers in a database of facts', false, 1),
    (q, 'By copying text from the internet in real time', false, 2),
    (q, 'By asking a human for the answer', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000007', 'What is a "hallucination" in the context of LLMs?', 'multiple_choice', 2,
     'A hallucination is when an LLM generates text that sounds confident and plausible but is factually wrong. Because LLMs predict likely text rather than retrieve facts, they can fabricate information that seems true.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'When the LLM generates plausible-sounding but factually wrong text', true, 0),
    (q, 'When the LLM sees things that are not on the screen', false, 1),
    (q, 'When the LLM crashes and produces an error', false, 2),
    (q, 'When the LLM refuses to answer a question', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000007', 'What does the "large" in Large Language Model refer to?', 'multiple_choice', 3,
     '"Large" refers to both the training dataset (billions of words of text) and the model size (billions of parameters). The scale of data and parameters is what enables LLMs to handle diverse language tasks.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'The massive scale of training data and model parameters', true, 0),
    (q, 'The physical size of the servers it runs on', false, 1),
    (q, 'The number of users it can serve simultaneously', false, 2),
    (q, 'The maximum length of text it can generate', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000007', 'True or False: An LLM truly understands meaning the way humans do.', 'true_false', 4,
     'False. LLMs learn statistical patterns in text — which words tend to appear together. They do not have human-like understanding, intent, or awareness. They are sophisticated pattern-matchers, not conscious thinkers.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'False — LLMs learn statistical patterns, not human-like understanding', true, 0),
    (q, 'True — LLMs understand meaning exactly like humans', false, 1);
END $$;

-- Lesson 8: Prompt Engineering Basics
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000008', 'What is a "prompt" in the context of AI tools?', 'multiple_choice', 0,
     'A prompt is the input text you give to an AI model to get a response. It is how you communicate what you want — the clearer and more specific your prompt, the better the output.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'The input text you give an AI model to get a response', true, 0),
    (q, 'A type of AI model architecture', false, 1),
    (q, 'A programming language for AI development', false, 2),
    (q, 'A hardware component in AI servers', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000008', 'Which is a better prompt for getting a useful AI response?', 'multiple_choice', 1,
     'Specific prompts with context and constraints produce far better results. "Write a 200-word intro email to a client named Sarah about our new analytics dashboard, friendly tone" gives the AI clear direction on format, audience, content, and style.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, '"Write a 200-word intro email to client Sarah about our analytics dashboard, friendly tone"', true, 0),
    (q, '"Write something good"', false, 1),
    (q, '"email"', false, 2),
    (q, '"Help me with my work"', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000008', 'What does "few-shot prompting" mean?', 'multiple_choice', 2,
     'Few-shot prompting includes a few examples of the desired input-output pattern in the prompt itself. This helps the model understand the format and style you want by showing, not just telling.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Including a few examples of the desired input-output pattern in the prompt', true, 0),
    (q, 'Training a model with very little data', false, 1),
    (q, 'Running the model on a small computer', false, 2),
    (q, 'Generating a few words at a time', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000008', 'Why might an AI give a poor answer to a vague prompt?', 'multiple_choice', 3,
     'AI models do not read minds. A vague prompt like "write something good" gives the model no direction on topic, format, audience, or tone. The model guesses, and the result rarely matches what you wanted.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'The model has no direction on what you actually want', true, 0),
    (q, 'The model is not smart enough to understand any prompt', false, 1),
    (q, 'The model requires a paid subscription for good answers', false, 2),
    (q, 'Vague prompts cause the model to crash', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000008', 'True or False: Giving the AI a role (e.g., "You are an expert editor") can improve output quality.', 'true_false', 4,
     'True. Assigning a role or persona helps the model adopt the right tone, vocabulary, and perspective. "You are an expert copy editor — review this paragraph for clarity and grammar" is more effective than "fix this."')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'True — assigning a role helps the model adopt the right perspective and tone', true, 0),
    (q, 'False — role-playing has no effect on AI output', false, 1);
END $$;

-- Lesson 9: AI Ethics and Limitations
DO $$
DECLARE q uuid;
BEGIN
  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000009', 'What is AI bias?', 'multiple_choice', 0,
     'AI bias occurs when a model produces systematically unfair outputs because its training data reflects historical or societal prejudices. Since AI learns from data created by humans, it can inherit and amplify human biases.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'When a model produces unfair outputs due to biased training data', true, 0),
    (q, 'When a model runs too slowly on old computers', false, 1),
    (q, 'When a model uses too much memory', false, 2),
    (q, 'When a model is programmed in a biased programming language', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000009', 'Why should you verify AI-generated information?', 'multiple_choice', 1,
     'AI models can hallucinate — producing confident but false information. They do not have a concept of truth, only statistical patterns. Always verify important facts from AI against reliable sources.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Because AI can hallucinate and produce plausible but false information', true, 0),
    (q, 'Because AI is always wrong', false, 1),
    (q, 'Because using AI is illegal in most countries', false, 2),
    (q, 'Because AI output is encrypted and unreadable', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000009', 'Which is a valid concern about AI in hiring?', 'multiple_choice', 2,
     'If an AI hiring tool is trained on historical hiring data that favored certain demographics, it will learn to replicate those patterns — automatically rejecting qualified candidates from underrepresented groups. This is AI bias in action.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'The AI could replicate historical hiring biases and reject qualified candidates', true, 0),
    (q, 'The AI might hire too many people', false, 1),
    (q, 'The AI would be too slow to process applications', false, 2),
    (q, 'The AI would replace all human workers', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000009', 'What is "responsible AI"?', 'multiple_choice', 3,
     'Responsible AI means developing and deploying AI systems in ways that are fair, transparent, accountable, and safe. It includes auditing for bias, being transparent about AI use, and having humans in the loop for important decisions.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'Developing AI that is fair, transparent, accountable, and safe', true, 0),
    (q, 'AI that is profitable for businesses', false, 1),
    (q, 'AI that uses the most advanced hardware', false, 2),
    (q, 'AI that replaces human decision-making entirely', false, 3);

  INSERT INTO lesson_questions (lesson_id, question, type, position, explanation) VALUES
    ('d1000000-0000-0000-0000-000000000009', 'True or False: AI models are objective because computers do not have feelings.', 'true_false', 4,
     'False. AI models are not objective — they reflect the biases in their training data, the choices of their developers, and the objectives they were optimized for. "Computer-generated" does not mean unbiased.')
  RETURNING id INTO q;
  INSERT INTO lesson_options (question_id, option_text, is_correct, position) VALUES
    (q, 'False — AI reflects biases in its training data and design choices', true, 0),
    (q, 'True — computers are always neutral and objective', false, 1);
END $$;

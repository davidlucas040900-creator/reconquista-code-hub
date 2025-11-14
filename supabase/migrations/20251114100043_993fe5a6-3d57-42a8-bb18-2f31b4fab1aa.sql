-- Adicionar coluna first_login_completed à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT false;
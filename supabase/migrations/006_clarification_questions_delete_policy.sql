-- Allow users to delete their own clarification questions
-- (needed when switching templates on the clarify page)
create policy "Users can delete own questions" on clarification_questions for delete
  using (exists (
    select 1 from requests
    where requests.id = clarification_questions.request_id
      and requests.user_id = auth.uid()
  ));

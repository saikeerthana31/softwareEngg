// src/actions/supabaseActions.ts
"use server";

import { supabaseAdmin } from "../utils/supabaseAdmin";

export async function approveUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ pending_approval: false })
    .eq("user_id", userId)
    .select("*");
  if (error) throw new Error(`Failed to approve user: ${error.message}`);
  return data;
}

export async function rejectUser(userId: string) {
  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(`Failed to reject user: ${error.message}`);
}

export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(`Failed to delete user: ${error.message}`);
}

export async function fetchUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("user_id, email, role, name, pending_approval");
  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  return {
    pendingUsers: data.filter((user) => user.pending_approval),
    allUsers: data.filter((user) => !user.pending_approval),
  };
}

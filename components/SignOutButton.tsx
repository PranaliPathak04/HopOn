"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-lane px-4 py-1.5 text-ink/70 hover:bg-lane-light"
    >
      Log out
    </button>
  );
}

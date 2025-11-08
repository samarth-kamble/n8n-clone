import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { Logout } from "./logout";

const Page = async () => {
  await requireAuth();

  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center dark:bg-black">
      Protected Server Components
      {JSON.stringify(data)}
      {data && <Logout />}
    </div>
  );
};

export default Page;

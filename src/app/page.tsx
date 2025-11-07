import prisma from "@/lib/db";

const Page = async () => {
  const user = await prisma.user.findMany();

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {JSON.stringify(user)}
    </div>
  );
};
export default Page;

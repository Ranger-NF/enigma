import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";

export default function SignInPage() {
  return (
    <div className="relative w-full">
      <Navbar01 />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <br />
        <p className="text-gray-600">To view the page</p>
      </div>
    </div>
  );
}

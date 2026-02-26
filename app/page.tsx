import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="animate-pulse rounded-full"
        />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to My Next.js App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This is a simple landing page built with Next.js and Tailwind CSS.
        </p>
      </div>
    </div>
  );
}

import ChatApp from "@/components/ChatApp";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0d0202]">
      <ChatApp />
    </main>
  );
}

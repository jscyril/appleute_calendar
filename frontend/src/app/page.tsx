import Image from "next/image";
import Calendar from "./components/Calendar";

export default function Home() {
  return (
    <div className="min-h-screen p-4">
      <Calendar />
    </div>
  );
}

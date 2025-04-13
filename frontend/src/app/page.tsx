import Calendar from "./components/Calendar";

export const metadata = {
  title: "Appleute Calendar",
};
export default function Home() {
  return (
    <div className="min-h-screen">
      <Calendar />
    </div>
  );
}

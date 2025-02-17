import { Users, GraduationCap, Video, Users2 } from "lucide-react";

const stats = [
  {
    icon: <GraduationCap className="w-8 h-8" />,
    count: "300",
    label: "Instructor",
    iconClass: "bg-emerald-500",
  },
  {
    icon: <Users className="w-8 h-8" />,
    count: "20,000+",
    label: "Student",
    iconClass: "bg-violet-500",
  },
  {
    icon: <Video className="w-8 h-8" />,
    count: "10,000+",
    label: "Video",
    iconClass: "bg-rose-500",
  },
  {
    icon: <Users2 className="w-8 h-8" />,
    count: "1,00,000+",
    label: "User's",
    iconClass: "bg-sky-500",
  },
];

export default function Stats() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-20">
      <div className="bg-white rounded-xl shadow-lg grid grid-cols-2 md:grid-cols-4 gap-8 p-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div
              className={`${stat.iconClass} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
            >
              {stat.icon}
            </div>
            <div className="font-bold text-2xl">{stat.count}</div>
            <div className="text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

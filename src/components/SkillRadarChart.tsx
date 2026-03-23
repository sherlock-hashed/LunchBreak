import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

interface RadarData {
  subject: string;
  accuracy: number;
  speed?: number;
  total?: number;
}

const fallbackData: RadarData[] = [
  { subject: "OS", accuracy: 50 },
  { subject: "DBMS", accuracy: 50 },
  { subject: "CN", accuracy: 50 },
  { subject: "OOPs", accuracy: 50 },
];

const SkillRadarChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<RadarData[]>(fallbackData);

  useEffect(() => {
    if (!user?._id) return;

    const fetchRadar = async () => {
      try {
        const res = await api.get(`/users/${user._id}/radar`);
        if (res.data.success && res.data.data?.length > 0) {
          setData(res.data.data);
        }
      } catch (err) {
        // console.error("SkillRadar fetch error:", err);
      }
    };

    fetchRadar();
  }, [user?._id]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="hsl(240 10% 16%)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "hsl(240 5% 50%)", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "hsl(240 5% 50%)", fontSize: 9, fontFamily: "JetBrains Mono, monospace" }}
          axisLine={false}
        />
        <Radar
          name="Skill"
          dataKey="accuracy"
          stroke="hsl(0 80% 40%)"
          fill="hsl(0 80% 40%)"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: "hsl(240 10% 8%)",
            border: "1px solid hsl(240 10% 20%)",
            borderRadius: 0,
            padding: "8px 12px",
          }}
          labelStyle={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "hsl(240 5% 70%)", marginBottom: 4 }}
          itemStyle={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "hsl(0 80% 50%)", padding: 0 }}
          formatter={(value: number, _name: string, entry: any) => {
            const total = entry?.payload?.total ?? 0;
            return [`${value}% accuracy (${total} Qs)`, "Skill"];
          }}
          cursor={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart;

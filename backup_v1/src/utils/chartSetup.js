// frontend/src/utils/chartSetup.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// optional global defaults (polished dark matte theme)
ChartJS.defaults.color = "#d1d5db";
ChartJS.defaults.font.family = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
ChartJS.defaults.plugins.legend.labels.color = "#9ca3af";
ChartJS.defaults.elements.line.tension = 0.2;

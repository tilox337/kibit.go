import type { TrafficLightSchedule } from "../../trafficLight";
import TrafficLightPopupView from "./TrafficLightPopup";

type TrafficLightPopupProps = {
  schedule: TrafficLightSchedule;
};

export default function TrafficLightPopup({ schedule }: TrafficLightPopupProps) {
  const startHour = Math.floor(schedule.startsAtSeconds / 3600) % 24;
  const phaseOffsetSeconds = ((schedule.startsAtSeconds % 3600) + 3600) % 3600;

  return (
    <TrafficLightPopupView
      redSeconds={schedule.redSeconds}
      greenSeconds={schedule.greenSeconds}
      startHour={startHour}
      phaseOffsetSeconds={phaseOffsetSeconds}
    />
  );
}

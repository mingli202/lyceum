import { ClassTime } from "@convex/types";

export default function checkForOverlap(classTimes: ClassTime[]) {
  const days: { [k in ClassTime["day"]]?: [string, string][] } = {};
  for (const classTime of classTimes) {
    if (!days[classTime.day]) {
      days[classTime.day] = [];
    }
    days[classTime.day]!.push([classTime.start, classTime.end]);
  }

  for (const times of Object.values(days)) {
    // loop through each pair of times
    // and compare them with the other pairs
    for (let i = 0; i < times.length - 1; i++) {
      for (let k = i + 1; k < times.length; k++) {
        const [start1, end1] = times[i];
        const [start2, end2] = times[k];

        // formats are like "09:00" and "10:00"
        const nStart1 = parseInt(start1.replace(":", ""));
        const nStart2 = parseInt(start2.replace(":", ""));
        const nEnd1 = parseInt(end1.replace(":", ""));
        const nEnd2 = parseInt(end2.replace(":", ""));

        if (nStart1 >= nEnd1 || nStart2 >= nEnd2) {
          throw new Error("Class ends in the past???");
        }

        if (
          nStart1 === nStart2 ||
          nEnd1 === nEnd2 ||
          (nStart1 > nStart2 && nEnd2 > nStart1) ||
          (nStart2 > nStart1 && nEnd1 > nStart2)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

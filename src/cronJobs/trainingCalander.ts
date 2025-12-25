import cron from "node-cron";
import TrainingCalendar from "../models/Training_Calendar.js";
import dayjs from "dayjs";

cron.schedule("* * * * *", () => {
  const handleRecurringTrainingCalendars = async () => {
    const today = dayjs().startOf("day").toDate();

    const recurringTrainings = await TrainingCalendar.find({
      recurrenceStatus: "active",
      recurrenceEndDate: {
        $gte: dayjs(today).startOf("day").toDate(),
        $lte: dayjs(today).endOf("day").toDate(),
      },
    });

    for (const training of recurringTrainings) {
      const currentEndDate = dayjs(training.recurrenceEndDate);
      let newRecurrenceEndDate: Date;

      if (training.recurrence === "weekly") {
        newRecurrenceEndDate = currentEndDate.add(7, "day").toDate();
      } else if (training.recurrence === "monthly") {
        newRecurrenceEndDate = currentEndDate.add(1, "month").toDate();
      } else {
        continue;
      }

      const clone = new TrainingCalendar({
        user: training.user,
        coach: training.coach,
        trainingName: training.trainingName,
        sport: training.sport,
        category: training.category,
        categories: training.categories,
        skill: training.skill,
        skills: training.skills,
        trainingScope: training.trainingScope,
        date: training.recurrenceEndDate,
        startTime: training.startTime,
        finishTime: training.finishTime,
        gym: training.gym,
        recurrence: training.recurrence,
        recurrenceEndDate: newRecurrenceEndDate,
        recurrenceStatus: "active",
        classLimit: training.classLimit,
        note: training.note,
        parentTrainingId: training.parentTrainingId || training._id,
      });

      await clone.save();

      training.recurrenceStatus = "in-active";
      await training.save();
    }
  };

  handleRecurringTrainingCalendars();
});

using System;
using System.Linq;

namespace WFM.Extensions
{
    public static class DateTimeExt
    {
        public static bool IsWorkDay(this DateTime dateTime)
        {
            return new[] { DayOfWeek.Monday,
                DayOfWeek.Tuesday,
                DayOfWeek.Wednesday,
                DayOfWeek.Thursday,
                DayOfWeek.Friday }.Contains(dateTime.DayOfWeek);
        }

        public static bool IsWorkTime(this DateTime dateTime)
        {
            return dateTime.IsWorkDay() && dateTime.Hour >= 9 && dateTime.Hour < 18;
        }

        public static DateTime GetNearestWorkTime(this DateTime dateTime)
        {
            if (dateTime.IsWorkTime())
                return dateTime;

            return dateTime.GetNextBusinessDay();
        }

        public static DateTime GetNextBusinessDay(this DateTime dateTime)
        {
            do
            {
                dateTime = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day + 1, 9, 0, 0);
            }
            while (!dateTime.IsWorkDay());

            return dateTime;
        }

        public static int WorkMinutesUntilTheEndOfTheDay(this DateTime dateTime)
        {
            if (!dateTime.IsWorkTime())
                return 0;

            return ((18 - dateTime.Hour) * 60) - dateTime.Minute;
        }

        public static (DateTime start, DateTime end) GetWorkWindows(this DateTime dateTime, int minutes)
        {
            var start = dateTime.IsWorkTime() ? dateTime : dateTime.GetNearestWorkTime();
            var end = start;

            while (end.WorkMinutesUntilTheEndOfTheDay() < minutes)
            {
                end = end.GetNextBusinessDay();
                minutes -= end.WorkMinutesUntilTheEndOfTheDay();
            }

            end = end.AddMinutes(minutes);

            return (start, end);
        }
    }
}

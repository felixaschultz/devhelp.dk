import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { ToggleButton } from "~/components";
import Calendar from "./Calendar";
import { RiArrowDownSLine } from "react-icons/ri";
export default function Filter({ className, numberOfDays, setNumberOfDays, compareRange, date }) {
    const compareRangeCheck = compareRange === 0 ? false : true;

    const [calendar, setCalendar] = useState(false);
    const [isCompare, setIsCompare] = useState(compareRangeCheck);
    const [selectedDays, setSelectedDays] = useState(numberOfDays);
    const [selectedCompareRange, setSelectedCompareRange] = useState(compareRange);
    const [selectedComparison, setSelectedComparison] = useState(
        compareRange === selectedDays ? "Previous period"
            : compareRange === selectedDays * 2 ? "Preceding period"
                : compareRange === selectedDays * 3 ? "Previous quarter"
                    : compareRange === selectedDays * 6 ? "Last 180 days"
                        : compareRange === "Same period last year" ? "Same period last year"
                            : "Previous period"
    );
    const [dateRange, setDateRange] = useState({
        start: new Date(date.start)?.toISOString()?.split("T")[0],
        end: new Date(date.end)?.toISOString()?.split("T")[0],
    });
    setNumberOfDays(selectedDays);

    const navigate = useNavigate();
    const endXDays = dateRange?.end;
    const startXDays = dateRange?.start;
    const previousPeriod = date?.previousStart;
    const previousPeriod2 = date?.previousEnd;

    function handleCalendarToggle() {
        setCalendar(!calendar);
    }

    return (
        <div className={className + " relative z-40"}>
            <div className="flex justify-center items-center cursor-pointer w-max ml-auto" onClick={
                handleCalendarToggle
            }>
                <p className="bg-primaryHover text-slate-100 text-sm rounded-md mr-2 px-2">Last {numberOfDays} days</p>
                <section>
                    <p className="text-sm text-right">{
                        new Intl.DateTimeFormat("da-DK", {
                            dateStyle: "short",
                        }).format(
                            new Date(startXDays)
                        )
                    } - {
                            new Intl.DateTimeFormat("da-DK", {
                                dateStyle: "short",
                            }).format(
                                new Date(endXDays)
                            )
                        }
                    </p>
                    {compareRangeCheck ? (
                        <p className="text-sm text-right"><span className="mx-2">compare</span>
                            {
                                new Intl.DateTimeFormat("da-DK", {
                                    dateStyle: "short",
                                }).format(
                                    new Date(previousPeriod2)
                                )
                            } - {
                                new Intl.DateTimeFormat("da-DK", {
                                    dateStyle: "short",
                                }).format(
                                    new Date(previousPeriod)
                                )
                            }
                        </p>
                    ) : null}
                </section>
                <RiArrowDownSLine size={25} />
            </div>
            {calendar && (
                <div className="grid auto-rows-max grid-cols-1 bg-slate-100 shadow-md absolute z-10 right-0 mt-3 w-[512px] h-[445px] rounded-md overflow-hidden">
                    <section className="grid grid-cols-2 h-[406px]">
                        <section className="border-r-2">
                            {/* <button onClick={(e) => {
                                e.preventDefault();
                                const value = 1;
                                setSelectedDays(value);
                            }} className={selectedDays !== 1 ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-700 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-700 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Yesterday</button> */}
                            <button onClick={(e) => {
                                e.preventDefault();
                                const value = 7;
                                const end = new Date().toISOString().split("T")[0];

                                date.end = new Date(new Date(end).setDate(new Date().getDate() - 1)).toISOString().split("T")[0];
                                date.start = new Date(new Date().setDate(new Date().getDate() - 8)).toISOString().split("T")[0];
                                setDateRange({ start: date.start, end: date.end });
                                setSelectedDays(value);
                                if (selectedComparison === "Previous period") {
                                    setSelectedCompareRange(value + 1);
                                } else if (selectedComparison === "Preceding period") {
                                    setSelectedCompareRange(value + 1 * 2);
                                } else if (selectedComparison === "Previous quarter") {
                                    setSelectedCompareRange(value + 1 * 3);
                                } else if (selectedComparison === "Last 180 days") {
                                    setSelectedCompareRange(value + 1 * 6);
                                } else if (selectedComparison === "Same period last year") {
                                    setSelectedCompareRange(value + 1 * 12);
                                }
                            }} className={selectedDays !== 7 ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Last 7 days</button>
                            <button onClick={(e) => {
                                e.preventDefault();
                                const value = 30;
                                const end = new Date().toISOString().split("T")[0];

                                date.end = new Date(new Date(end).setDate(new Date().getDate() - 1)).toISOString().split("T")[0];
                                date.start = new Date(new Date().setDate(new Date().getDate() - 31)).toISOString().split("T")[0];
                                setDateRange({ start: date.start, end: date.end });
                                setSelectedDays(value);
                                if (selectedComparison === "Previous period") {
                                    setSelectedCompareRange(value + 1);
                                } else if (selectedComparison === "Preceding period") {
                                    setSelectedCompareRange(value + 1 * 2);
                                } else if (selectedComparison === "Previous quarter") {
                                    setSelectedCompareRange(value + 1 * 3);
                                } else if (selectedComparison === "Last 180 days") {
                                    setSelectedCompareRange(value + 1 * 6);
                                } else if (selectedComparison === "Same period last year") {
                                    setSelectedCompareRange(value + 1 * 12);
                                }
                            }} className={selectedDays !== 30 ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Last 30 days</button>
                            <button onClick={(e) => {
                                e.preventDefault();
                                const value = 90;
                                const end = new Date().toISOString().split("T")[0];

                                date.end = new Date(new Date(end).setDate(new Date().getDate() - 1)).toISOString().split("T")[0];
                                date.start = new Date(new Date().setDate(new Date().getDate() - 91)).toISOString().split("T")[0];

                                setDateRange({ start: date.start, end: date.end });
                                setSelectedDays(value);
                                if (selectedComparison === "Previous period") {
                                    setSelectedCompareRange(value);
                                } else if (selectedComparison === "Preceding period") {
                                    setSelectedCompareRange(value * 2);
                                } else if (selectedComparison === "Previous quarter") {
                                    setSelectedCompareRange(value * 3);
                                } else if (selectedComparison === "Last 180 days") {
                                    setSelectedCompareRange(value * 6);
                                } else if (selectedComparison === "Same period last year") {
                                    setSelectedCompareRange(value * 12);
                                }
                            }} className={selectedDays !== 90 ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Last 90 days</button>
                            <section className="border-t-2 pt-4">
                                {isCompare ? <div className="flex justify-between px-2">Compare <ToggleButton enabled={true} onChange={() => {
                                    setIsCompare(!isCompare);
                                }} /></div> : <div className="flex justify-between px-2">Compare <ToggleButton enabled={false} onChange={() => {
                                    setIsCompare(!isCompare);
                                }} /></div>}
                                {isCompare && (
                                    <section>
                                        <button onClick={(e) => {
                                            e.preventDefault();
                                            const name = "Previous period";
                                            setSelectedComparison(name);
                                            setSelectedCompareRange(selectedDays);
                                        }} className={selectedComparison !== "Previous period" ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Previous period</button>
                                        <button onClick={(e) => {
                                            e.preventDefault();
                                            const name = "Preceding period";
                                            setSelectedComparison(name);
                                            setSelectedCompareRange(selectedDays * 2);
                                        }} className={selectedComparison !== "Preceding period" ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Preceding period</button>
                                        <button onClick={(e) => {
                                            e.preventDefault();
                                            const name = "Previous quarter";
                                            setSelectedComparison(name);
                                            setSelectedCompareRange(90);
                                        }} className={selectedComparison !== "Previous quarter" ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Last 90 days</button>
                                        <button onClick={(e) => {
                                            e.preventDefault();
                                            const name = "Last 180 days";
                                            setSelectedComparison(name);
                                            setSelectedCompareRange(180);
                                        }} className={selectedComparison !== "Last 180 days" ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Last 180 days</button>
                                        <button onClick={(e) => {
                                            e.preventDefault();
                                            const name = "Same period last year";
                                            setSelectedComparison(name);
                                            setSelectedCompareRange(name);
                                        }} className={selectedComparison !== "Same period last year" ? "block w-full text-left p-2 hover:bg-primaryHover hover:text-slate-100 cursor-pointer" : "block bg-primary text-slate-100 hover:text-slate-100 w-full text-left p-2 hover:bg-primaryHover cursor-pointer"}>Same period last year</button>
                                    </section>
                                )}
                            </section>
                        </section>
                        <Calendar compareRange={compareRange} selectedDays={selectedDays} setSelectedDays={setSelectedDays} startDate={dateRange.start} endDate={dateRange.end} setDateRange={setDateRange} handleCalendarToggle={handleCalendarToggle} />
                    </section>
                    <footer>
                        <button onClick={
                            handleCalendarToggle
                        } className="bottom-0 col-span-2 text-slate-100 bg-secondaryDark w-1/2 right-0 p-2 hover:bg-slate-100 hover:text-primary cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={(e) => {
                            e.preventDefault();
                            handleCalendarToggle();
                            if (!isCompare) {
                                navigate({
                                    search: '?startDate=' + startXDays + '&endDate=' + endXDays + '&days=' + selectedDays
                                })
                            } else {
                                navigate({
                                    search: '?startDate=' + startXDays + '&endDate=' + endXDays + '&compareRange=' + selectedCompareRange + '&days=' + selectedDays
                                })
                            }
                        }
                        } className="bottom-0 col-span-2 text-slate-100 bg-primary w-1/2 right-0 p-2 hover:bg-primaryHover cursor-pointer">
                            Apply
                        </button>
                    </footer>
                </div>
            )
            }
        </div >
    )
}
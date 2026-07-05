import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Booking() {

    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [pkg, setPkg] = useState(null);

    const [form, setForm] = useState({
        Booking_Date: "",
        Pickup_Time: "",
        Pickup_Location: "",
        No_of_adults: 1,
        No_of_child: 0,
    });

    // Load package
    useEffect(() => {
        fetchPackage();
    }, []);

    const fetchPackage = async () => {
        try {
            const res = await api.get(`/packages/${id}`);
            setPkg(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    // handle input change
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // calculate total price
    const getTotal = () => {
        if (!pkg) return 0;

        const adultTotal = form.No_of_adults * pkg.Price_for_adult;
        const childTotal = form.No_of_child * pkg.Price_for_child;

        return adultTotal + childTotal;
    };

    // submit booking
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/bookings", {
                Booking_Date: form.Booking_Date,
                Pickup_Time: form.Pickup_Time,
                Pickup_Location: form.Pickup_Location,
                No_of_adults: form.No_of_adults,
                No_of_child: form.No_of_child,
                Package_ID: id,
                Customer_ID: user.Customer_ID,
                Payment: getTotal()
            });

            alert("Booking Successful 🎉");

            navigate("/user/bookings");

        } catch (err) {
            console.log(err);
            console.log(err.response);

            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Booking Failed"
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F8F3] flex justify-center py-10">

            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">

                <h2 className="text-2xl font-bold text-green-800 mb-4">
                    Book Safari
                </h2>

                {/* Package Info */}
                {pkg && (
                    <div className="mb-6 p-4 bg-green-50 rounded-xl">
                        <h3 className="text-xl font-semibold">
                            {pkg.Package_Name}
                        </h3>

                        <p className="text-gray-600 mt-2">
                            {pkg.Description}
                        </p>

                        <div className="mt-3 flex justify-between">
                            <span>Adult: Rs {pkg.Price_for_adult}</span>
                            <span>Child: Rs {pkg.Price_for_child}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="text-sm font-semibold">Booking Date</label>
                        <input
                            type="date"
                            name="Booking_Date"
                            className="w-full border p-2 rounded"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Pickup Time</label>
                        <input
                            type="time"
                            name="Pickup_Time"
                            className="w-full border p-2 rounded"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Pickup Location</label>
                        <input
                            type="text"
                            name="Pickup_Location"
                            className="w-full border p-2 rounded"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex gap-4">

                        <div className="w-1/2">
                            <label className="text-sm font-semibold">Adults</label>
                            <input
                                type="number"
                                name="No_of_adults"
                                min="1"
                                className="w-full border p-2 rounded"
                                value={form.No_of_adults}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="w-1/2">
                            <label className="text-sm font-semibold">Children</label>
                            <input
                                type="number"
                                name="No_of_child"
                                min="0"
                                className="w-full border p-2 rounded"
                                value={form.No_of_child}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    {/* Total */}
                    <div className="bg-green-100 p-3 rounded-lg font-bold">
                        Total Price: Rs {getTotal()}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800"
                    >
                        Confirm Booking
                    </button>

                </form>

            </div>

        </div>
    );
}
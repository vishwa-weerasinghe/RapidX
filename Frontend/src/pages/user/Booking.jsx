import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../axios";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const guestCustomer = JSON.parse(localStorage.getItem("guest_customer") || "null");
  const activeCustomer = user || guestCustomer;
  const isRegistered = !!user;

  const [pkg, setPkg] = useState(null);

  const [form, setForm] = useState({
    Booking_Date: "",
    Pickup_Time: "",
    Pickup_Location: "",
    No_of_adults: 1,
    No_of_child: 0,
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_No: "",
    NIC: "",
    Country: "",
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

  // Load customer profile if logged in or has guest session
  useEffect(() => {
    if (user) {
      api.get('/customer-profile')
        .then((res) => {
          if (res.data) {
            setForm((prev) => ({
              ...prev,
              First_Name: res.data.First_Name || "",
              Last_Name: res.data.Last_Name || "",
              Email: res.data.Email || "",
              Phone_No: res.data.Phone_No || "",
              NIC: res.data.NIC || "",
              Country: res.data.Country || "",
            }));
          }
        })
        .catch((err) => console.error("Error loading customer profile:", err));
    } else if (guestCustomer) {
      setForm((prev) => ({
        ...prev,
        First_Name: guestCustomer.First_Name || "",
        Last_Name: guestCustomer.Last_Name || "",
        Email: guestCustomer.Email || "",
        Phone_No: guestCustomer.Phone_No || "",
        NIC: guestCustomer.NIC || "",
        Country: guestCustomer.Country || "",
      }));
    }
  }, [user, guestCustomer]);

  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
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

    const payload = {
      Booking_Date: form.Booking_Date,
      Pickup_Time: form.Pickup_Time,
      Pickup_Location: form.Pickup_Location,
      No_of_adults: form.No_of_adults,
      No_of_child: form.No_of_child,
      Package_ID: id,
      Payment: getTotal(),
    };

    if (activeCustomer?.Customer_ID) {
      payload.Customer_ID = activeCustomer.Customer_ID;
    } else {
      payload.First_Name = form.First_Name;
      payload.Last_Name = form.Last_Name;
      payload.Email = form.Email;
      payload.Phone_No = form.Phone_No;
      payload.NIC = form.NIC;
      payload.Country = form.Country;
    }

    if (isRegistered) {
      payload.Customer_ID = user.Customer_ID;
      try {
        await api.post("/cart", payload);
        alert("Added to cart successfully 🎉");
        navigate("/user/dashboard");
      } catch (err) {
        console.log(err);
        alert(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to add safari to cart"
        );
      }
    } else {
      localStorage.setItem("pending_cart", JSON.stringify(payload));
      localStorage.setItem("guest_profile_prefill", JSON.stringify({
        First_Name: form.First_Name,
        Last_Name: form.Last_Name,
        Email: form.Email,
        Phone_No: form.Phone_No,
        NIC: form.NIC,
        Country: form.Country,
      }));
      alert("Please register to add this booking to your cart.");
      navigate("/register");
    }
  };




  return (
    <div className="min-h-screen bg-offwhite flex justify-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-sacramento mb-4">Book Safari</h2>

        {/* Package Info */}
        {pkg && (
          <div className="mb-6 p-4 bg-castleton-50 rounded-xl">
            <h3 className="text-xl font-semibold">{pkg.Package_Name}</h3>

            <p className="text-gray-600 mt-2">{pkg.Description}</p>

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
              value={form.Booking_Date}
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
              value={form.Pickup_Time}
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
              value={form.Pickup_Location}
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">First Name</label>
            <input
              type="text"
              name="First_Name"
              value={form.First_Name}
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Last Name</label>
            <input
              type="text"
              name="Last_Name"
              value={form.Last_Name}
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              name="Email"
              value={form.Email}
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Phone Number</label>
            <input
              type="text"
              name="Phone_No"
              value={form.Phone_No}
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">NIC</label>
            <input
              type="text"
              name="NIC"
              value={form.NIC}
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Country</label>
            <input
              type="text"
              name="Country"
              value={form.Country}
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
          <div className="bg-castleton-50 p-3 rounded-lg font-bold">
            Total Price: Rs {getTotal()}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-sacramento text-white py-2 rounded hover:bg-sacramento-600"
          >
            Add to Cart
          </button>
        </form>
      </div>
    </div>
  );
}

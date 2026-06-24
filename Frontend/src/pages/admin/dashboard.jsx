//import { useState } from "react";

export default function AdminDashboard({ user }) {
    return (
        <div>
            <h1 className="text-3xl font-bold text-green-900">
                Admin Dashboard
            </h1>

            <p className="mt-4 text-gray-600">
                Welcome back,
                <span className="font-bold text-green-700">
                {" "}
                {user?.User_Name}
                </span>
            </p>
        </div>
    );
}

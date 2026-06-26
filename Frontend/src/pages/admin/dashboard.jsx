export default function AdminDashboard({ user }) {
    return (
        <div className="transition-colors duration-300">

            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-900">
                Admin Dashboard
            </h1>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Welcome back,
                <span className="font-semibold text-gray-800 dark:text-gray-900">
                    {" "}
                    {user?.User_Name}
                </span>
            </p>

        </div>
    );
}
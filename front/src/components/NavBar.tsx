import { NavLink } from "react-router-dom";
import { FaUser, FaFilePdf, FaSignOutAlt } from "react-icons/fa";

export default function NavBar() {
    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center py-4 px-2">
                        <span className="text-xl font-bold text-gray-800">Logo</span>
                    </div>
                    <div className="flex items-center space-x-7">
                        <NavLink to="/home" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                            <FaFilePdf className="text-blue-500" />
                            PDF
                        </NavLink>
                        <NavLink to="/profil" className="text-gray-700 hover:text-blue-600 flex items-center gap-2">
                            <FaUser className="text-blue-500" />
                            Username
                        </NavLink>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2">
                            <FaSignOutAlt className="text-white" />
                            Déconnexion
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
}
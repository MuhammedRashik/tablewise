import { useState } from "react";
import { useKitchenAuth } from "../hooks/useKitchenAuth";
import { ChefHat } from "lucide-react";

export default function KitchenLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useKitchenAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl border border-gray-700 p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-400 flex items-center justify-center">
            <ChefHat size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Kitchen display</h1>
            <p className="text-xs text-gray-400">TableWise</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@restaurant.com"
              className="
                w-full h-11 px-4 bg-gray-900 border border-gray-700 rounded-xl
                text-sm text-white placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
              "
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="
                w-full h-11 px-4 bg-gray-900 border border-gray-700 rounded-xl
                text-sm text-white placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
              "
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/30 border border-red-800/50 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="
              w-full h-11 bg-brand-400 hover:bg-brand-600 text-white font-medium
              rounded-xl flex items-center justify-center gap-2
              transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              mt-2
            "
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ChefHat size={16} /> Enter kitchen
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-600 text-center mt-4">
          Use your staff account credentials
        </p>
      </div>
    </div>
  );
}
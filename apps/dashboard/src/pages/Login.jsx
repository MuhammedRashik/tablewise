import { useState } from "react";
import { useLogin } from "../hooks/useAuth";
import Input from "../components/ui/Input";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-400 flex items-center justify-center text-white font-bold">
            TW
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">TableWise</h1>
            <p className="text-xs text-gray-400">Staff dashboard</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="staff@restaurant.com" />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
          )}

          <button
            onClick={() => login({ email, password })}
            disabled={isLoading || !email || !password}
            className="btn-primary w-full mt-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
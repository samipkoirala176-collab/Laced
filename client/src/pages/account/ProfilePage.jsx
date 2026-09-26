import { useEffect, useState } from 'react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setProfile(user);
        setLoading(false);
        return;
      }

      try {
        const me = await authApi.getMe();
        setProfile(me);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Unable to load your profile right now.</div>;
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900">Your account</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Name</p>
          <p className="mt-3 text-lg font-medium text-slate-900">{profile.name}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</p>
          <p className="mt-3 text-lg font-medium text-slate-900">{profile.email}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Role</p>
          <p className="mt-3 text-lg font-medium text-slate-900">{profile.role}</p>
        </div>
      </div>
    </div>
  );
}

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            T
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
            TaskPad
          </span>
        </div>
        <SignIn
          appearance={{
            elements: {
              card: 'shadow-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl',
              headerTitle: 'text-slate-900 dark:text-slate-100 font-bold',
              headerSubtitle: 'text-slate-500 dark:text-slate-400',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg',
            },
          }}
        />
      </div>
    </div>
  );
}

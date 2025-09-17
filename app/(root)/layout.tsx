import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  const { user, account } = currentUser;

  return (
    <main className="flex h-screen">
      <Sidebar
        fullName={user?.fullName || account.name || "User"}
        avatar={user?.avatar || ""}
        email={user?.email || account.email}
      />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation
          ownerId={user?.$id || ""}
          accountID={account.id}
          fullName={user?.fullName || account.name || "User"}
          avatar={user?.avatar || ""}
          email={user?.email || account.email}
        />
        <Header userId={user?.$id || ""} accountId={account.id} />
        <div className="main-content">{children}</div>
      </section>
    </main>
  );
};

export default Layout;

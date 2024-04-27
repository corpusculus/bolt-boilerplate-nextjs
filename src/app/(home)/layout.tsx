import { Navbar } from "./_components/navbar";

const HomeLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="h-full">
            <Navbar />
            <main className="h-full pt-32">
                {children}
            </main>
        </div>
    )
}

export default HomeLayout;
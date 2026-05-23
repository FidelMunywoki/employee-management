import { useEffect, useState, useTransition } from 'react'
import { Link, useLocation , useNavigate} from "react-router-dom"
import { dummyProfileData } from "../assets/assets"
import { Calendar1Icon, ChevronRightIcon, DollarSignIcon, FileTextIcon, LayoutGridIcon, LogOutIcon, Menu as MenuIcon, SettingsIcon, User as UserIcon, XIcon } from "lucide-react"

const Sidebar = () => {

    const { pathname } = useLocation()
    const navigate = useNavigate()
    const [userName, setUserName] = useState("")
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        // Simulate fetching user data
        setTimeout(() => {
            setUserName(dummyProfileData.firstName + " " + dummyProfileData.lastName)
        }, 1000)
    }, [])

    // Close mobile sidebar on route change only if it is open
    const [, startTransition] = useTransition()

    useEffect(() => {
        if (mobileOpen) {
            startTransition(() => {
                setMobileOpen(false)
            })
        }
    }, [pathname, mobileOpen, startTransition])

    const role = "Admin" || "Employee"; // This should come from your auth context or API

    const navigationItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutGridIcon },
        role === "Admin" ? 
        { name: "Employee", href: "/employee", icon: UserIcon } :
        { name: "Attendance", href: "/attendance", icon: Calendar1Icon },
        { name: "Leave", href: "/leave", icon: FileTextIcon },
        { name: "Payslips", href: "/payslips", icon: DollarSignIcon },
        { name: "Settings", href: "/settings", icon: SettingsIcon }
    ]

    const handleLogout = () => {
        // Implement logout logic here (e.g., clear tokens, redirect to login page)
        // Redirect to login page
        console.log("User logged out")
        navigate("/login")
    }

    const sidebarContent = (
        <>
        {/* Brand Header */}
        <div className='px-5 pt-6 pb-5 border-b border-white/6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <UserIcon className="text-white size-7"/>
                    <div>
                        <p className='font-semibold text-[13px] tracking-wide'>Employee MS</p>
                        <p className='text-[11px] text-slate-500 font-medium'>Management System</p>
                </div>
            </div>
            {/* Mobile close button */}
            <button onClick={()=>setMobileOpen(false)} className='lg:hidden text-slate-400 p-1 bg-slate-900 hover:text-white rounded-lg border border-white/10'>
                <XIcon size={20} />
            </button>
                
        </div>
    
        </div>

        {/* User Profile card*/}
        <div className='mx-3 mt-4 mb-1 p-3 rounded-lg bg-white/3 border border-white/4'>
           
            <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-white/10 shrink-0'>
                    <span className='text-slate-400 text-xs font-semibold'>
                        {userName ? userName.charAt(0).toUpperCase() : "?"}
                    </span>
                </div>
                <div className='min-w-0'>
                    <p className='text-[13px] font-medium text-slate-200 truncate'>{userName || "Loading..."}</p>
                    <p className='text-[11px] text-slate-500 truncate'>{role === "Admin" ? "Admin" : "Employee"}</p>
                </div>
            </div>
        </div>


        {/* Section Labels*/}
        <div className='px-5 pt-5 pb-2'>
            <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500'>Navigation</p>
        </div>

        {/* Navigation List */}
        <div className='flex-1 px-3 space-y-0.5 overflow-y-auto'>
            {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                   <Link key={item.name} to={item.href} className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                        {isActive && <div className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500' />}
                        <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? "text-indigo-300" : "text-slate-400 group-hover:text-slate-300"}`} />
                        <span className='flex-1'>{item.name}</span>
                        {isActive && <ChevronRightIcon className='w-3.5 h-3.5 text-indigo-500/50'/>}
                    </Link>
                )
            })}
        </div>


        {/* Logout Button */}
        <div className='p-3 border-t border-white/6'>
            <button onClick={handleLogout} className='flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-slate-400 hover:text-rose-400
            hover:bg-rose-500/8 transition-all duration-150'>
                <LogOutIcon className='w-[17px] h-[17px]'/>
                <span className=''>Logout</span>
            </button>
        </div>
        </>
    )


  return (
    <div>
        {/* Mobile hamburger menu */}
        <button onClick={()=>setMobileOpen(true)} className='lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg border border-white/10'>
            <MenuIcon size={20} />
        </button>

        {/* mobile overlay */}
        {mobileOpen && (
            <div className='lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm' onClick={()=>setMobileOpen(false)}/>
            
        )}

        {/* Sidebar - Desktop */} 
        <aside className='hidden lg:flex lg:flex-col h-full w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shrink-0 border-r border-white/10'>
            {sidebarContent}
        </aside>

        {/* Sidebar - Mobile */}
        <aside className={`lg:hidden fixed top-0 left-0 inset-y-0 h-full w-[260px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white z-50 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300`}>
            {sidebarContent}
        </aside>


    </div>
  )
}

export default Sidebar
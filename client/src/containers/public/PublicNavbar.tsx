import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAppSelector } from '@/states/hooks';
import basisTransportLogo from '/logo.svg';

export interface PublicNavbarProps {variant?:'default'|'auth'}
export default function PublicNavbar({variant='default'}:PublicNavbarProps){
  const [open,setOpen]=useState(false),user=useAppSelector(s=>s.auth.user);
  const links=[['/travel','Plan a journey'],['/routes','Routes'],['/stops','Stops'],['/saved','Saved']];
  return <header className="invert-surface sticky top-0 z-(--z-navbar)"><nav className="landing-container" aria-label="Public navigation"><div className="flex h-16 items-center justify-between gap-4">
    <Link to="/" className="flex items-center gap-2.5 text-(--ink)"><img src={basisTransportLogo} alt="" className="size-7 brightness-0 invert"/><span className="text-base font-medium">Basis</span></Link>
    {variant!=='auth'&&<><div className="hidden items-center gap-1 md:flex">{links.map(([to,label])=><NavLink key={to} to={to} className={({isActive})=>'rounded-lg px-3 py-3 text-sm '+(isActive?'bg-(--surface) text-(--ink)':'text-(--muted) hover:text-(--ink)')}>{label}</NavLink>)}<Link to={user?'/account/profile':'/auth/login'} className="ml-3 px-3 py-3 text-sm text-(--muted)">{user?'Account':'Sign in'}</Link></div><button type="button" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} className="flex size-11 items-center justify-center text-(--ink) md:hidden" onClick={()=>setOpen(v=>!v)}>{open?<X size={22}/>:<Menu size={22}/>}</button></>}
  </div>{open&&variant!=='auth'&&<div className="grid pb-4 md:hidden">{links.map(([to,label])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-3 text-sm text-(--ink)">{label}</NavLink>)}<Link to={user?'/account/profile':'/auth/login'} className="px-3 py-3 text-sm text-(--muted)">{user?'Account':'Sign in'}</Link></div>}</nav></header>;
}

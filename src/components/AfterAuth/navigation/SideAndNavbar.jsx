import React, { useState, useRef, useEffect } from "react";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/16/solid";

import {
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";

import logo from '/logo.svg';
import { School } from "lucide-react";
import { Link } from "react-router-dom";
import { SideBarData, SideBarSupportData } from "../../../utils/Constants";


function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose?.();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [ref, onClose]);
}

/* ============ primitives (Avatar / Dropdown) ============ */

const Avatar = ({ src, initials, square = false, alt = "", className = "" }) => {
  return src ? (
    <img
      src={src}
      alt={alt}
      className={classNames(
        "h-8 w-8 object-cover ring-1 ring-black/5 ",
        square ? "rounded-md" : "rounded-full",
        className
      )}
    />
  ) : (
    <span
      className={classNames(
        "flex h-8 w-8 items-center justify-center text-xs font-medium bg-zinc-200 text-zinc-700 ring-1 ring-black/5 ",
        square ? "rounded-md" : "rounded-full",
        className
      )}
      aria-hidden
    >
      {initials || "A"}
    </span>
  );
};

const Dropdown = ({ anchor = "bottom end", button, children, className = "" }) => {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useOutsideClose(boxRef, () => setOpen(false));

  const anchorClasses = {
    "bottom end": "top-full right-0 mt-2 origin-top-right",
    "bottom start": "top-full left-0 mt-2 origin-top-left",
    "top start": "bottom-full left-0 mb-2 origin-bottom-left",
    "top end": "bottom-full right-0 mb-2 origin-bottom-right",
  }[anchor];

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md p-1.5 hover:bg-zinc-100 "
      >
        {button}
      </button>
      {open && (
        <div
          className={classNames(
            "absolute z-50 min-w-64 rounded-lg border border-zinc-200 bg-white p-1 text-sm shadow-lg ",
            anchorClasses,
            className
          )}
          role="menu"
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
};


const DropdownItem = ({ href = "#", icon: Icon, children, onClick }) => (
  <Link
    to={href}
    onClick={onClick}
    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-zinc-700 hover:bg-zinc-100 "
  >
    {Icon && <Icon className="h-4 w-4 shrink-0" />}
    <span className="truncate">{children}</span>
  </Link>
);

const DropdownDivider = () => <div className="my-1 h-px bg-zinc-200 " />;

/* ============ Navbar ============ */

const Navbar = ({ children }) => (
  <div className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur py-2 ">
    <div className="mx-auto flex h-14 max-w-7xl items-center px-3 sm:px-4 lg:px-6">{children}</div>
  </div>
);

const NavbarSpacer = () => <div className="flex-1" />;

const NavbarSection = ({ children }) => <div className="flex items-center gap-1.5">{children}</div>;

const NavbarItem = ({ href = "#", ariaLabel, children }) => (
  <a
    href={href}
    aria-label={ariaLabel}
    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 "
  >
    {children}
  </a>
);

const SidebarLayout = ({ navbar, sidebar, children }) => (
  <div className="min-h-screen bg-white text-zinc-900 ">
    {navbar}
    <div className="mx-auto grid  grid-cols-1 gap-6 px-3 pb-10 pt-4 sm:px-4 lg:grid-cols-[280px_1fr] lg:px-6">
      {sidebar}
      <main className="min-h-[60vh]">{children}</main>
    </div>
  </div>
);

const Sidebar = ({ children }) => (
  <aside className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm ">
    <div className="flex h-full flex-col">{children}</div>
  </aside>
);

const SidebarHeader = ({ children }) => <div className="space-y-2 p-2">{children}</div>;

const SidebarBody = ({ children }) => <div className="flex-1 space-y-2 p-2">{children}</div>;

const SidebarFooter = ({ children, className = "" }) => (
  <div className={classNames("border-t border-zinc-200 p-2 ", className)}>{children}</div>
);

const SidebarSection = ({ children, className = "" }) => (
  <div className={classNames("space-y-1 rounded-lg bg-zinc-50 p-2 ", className)}>{children}</div>
);

const SidebarHeading = ({ children }) => (
  <div className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 ">
    {children}
  </div>
);
const SidebarSpacer = () => <div className="h-2" />;

const SidebarItem = ({ href , children }) => (
  <Link
    to={href}
    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-700 hover:bg-white hover:shadow-sm "
  >
    {React.Children.map(children, (child, i) =>
      i === 0 ? React.cloneElement(child, { className: "h-4 w-4 shrink-0" }) : child
    )}
  </Link>
);

const SidebarLabel = ({ children }) => <span className="truncate">{children}</span>;


export default function SideAndNavbar({children}) {
  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <img src={logo} className="w-12 h-12" alt="" /><span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">QBMS</span>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/search" ariaLabel="Search">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </NavbarItem>
            <NavbarItem href="/inbox" ariaLabel="Inbox">
              <InboxIcon className="h-5 w-5" />
            </NavbarItem>

            {/* Profile dropdown */}
            <Dropdown
              button={<Avatar src="https://i.pravatar.cc/80?img=11" square />}
              anchor="bottom end"
            >
              {({ close }) => (
                <>
                  <DropdownItem href="/my-profile" icon={UserIcon} onClick={close}>
                    My profile
                  </DropdownItem>
                  <DropdownItem href="/settings" icon={Cog8ToothIcon} onClick={close}>
                    Settings
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/privacy-policy" icon={ShieldCheckIcon} onClick={close}>
                    Privacy policy
                  </DropdownItem>
                  <DropdownItem href="/share-feedback" icon={LightBulbIcon} onClick={close}>
                    Share feedback
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/logout" icon={ArrowRightStartOnRectangleIcon} onClick={close}>
                    Sign out
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          {/* Header */}
          <SidebarHeader>
            {/* Team switcher */}
            <Dropdown
              anchor="bottom start"
              button={
                <div className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 hover:bg-zinc-100 ">
                  <Avatar src={logo} />
                  <SidebarLabel>Evalvo Qbms</SidebarLabel>
                  <ChevronDownIcon className="ml-auto h-4 w-4 opacity-70" />
                </div>
              }
              className="min-w-72"
            >
              {({ close }) => (
                <>
                  <DropdownItem icon={School} onClick={close}>
                    Schools 
                  </DropdownItem>
                  
                  <DropdownDivider />
                    
                  <DropdownItem href="manage-school" onClick={close}>
                    <span className="flex items-center gap-2">
                      <Avatar initials="MS" className="bg-purple-500 text-white" />
                      <span>Manage School</span>
                    </span>
                  </DropdownItem>

                  <DropdownDivider />

                  <DropdownItem href="add-school" icon={PlusIcon} onClick={close}>
                    Add New School
                  </DropdownItem>
                </>
              )}
            </Dropdown>

            
          </SidebarHeader>

          {/* Body */}
          <SidebarBody>

            <SidebarSection>
              <SidebarHeading>Main pages</SidebarHeading>
              {
                SideBarData.map((item,key) => (
                  <SidebarItem key={key} href={item.href}>
                    <HomeIcon/>
                    <SidebarLabel>{item.name}</SidebarLabel>
                  </SidebarItem>
                ))
              }
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Support pages</SidebarHeading>
              {
                SideBarSupportData.map((item,key) => (
                  <SidebarItem key={key} href={item.href}>
                    <SidebarLabel>{item.name}</SidebarLabel>
                  </SidebarItem>
                ))
              }
            </SidebarSection>

            <SidebarSpacer />

            {/* Quick actions */}

            <SidebarSection className="max-lg:hidden">
              <SidebarItem href="manage-po">
                <SidebarLabel>PO ( Program Outcome )</SidebarLabel>
              </SidebarItem>

              <SidebarItem href="manage-co">
                <SidebarLabel>CO ( Course Outcome )</SidebarLabel>
              </SidebarItem>

              <SidebarItem href="manage-co-po">
                <SidebarLabel>CO-PO Maping</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

          </SidebarBody>

          {/* Footer */}
          <SidebarFooter className="max-lg:hidden">
            <Dropdown
              anchor="top start"
              button={
                <div className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 hover:bg-zinc-100 ">
                  <Avatar src="https://i.pravatar.cc/80?img=32" className="h-10 w-10" square alt="" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-950 ">
                      Erica
                    </span>
                    <span className="block truncate text-xs text-zinc-500 ">
                      erica@example.com
                    </span>
                  </span>
                  <ChevronUpIcon className="ml-auto h-4 w-4 opacity-70" />
                </div>
              }
            >
              {({ close }) => (
                <>
                  <DropdownItem href="/my-profile" icon={UserIcon} onClick={close}>
                    My profile
                  </DropdownItem>
                  <DropdownItem href="/settings" icon={Cog8ToothIcon} onClick={close}>
                    Settings
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/privacy-policy" icon={ShieldCheckIcon} onClick={close}>
                    Privacy policy
                  </DropdownItem>
                  <DropdownItem href="/share-feedback" icon={LightBulbIcon} onClick={close}>
                    Share feedback
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem href="/logout" icon={ArrowRightStartOnRectangleIcon} onClick={close}>
                    Sign out
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}

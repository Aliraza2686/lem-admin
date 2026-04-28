import { cn } from "../../../../utillls/common"

// import logo from "../../../public/logo.png"/
export const Logo = ({className}) => {
    return (
        <div className="">
            <img src={"https://res.cloudinary.com/dptmeakuy/image/upload/v1772106872/lumina_logo_transparent_ykxrl5.png"} alt="logo" className={cn("w-16 h-16", className)} />
        </div>
    )
}
import { useState } from "react";
import type { NuevoUsuarioInput, Usuario } from "../useProducts";

export function useUserAdminForm() {
    const [newUser, setNewUser] = useState<NuevoUsuarioInput>({
        username: "",
        rol: "vendedor",
        password: "",
    });
    const [resetPasswordUser, setResetPasswordUser] = useState<Usuario | null>(null);
    const [resetPasswordValue, setResetPasswordValue] = useState("");

    function resetNewUserForm() {
        setNewUser({ username: "", rol: "vendedor", password: "" });
    }

    function openResetPassword(user: Usuario) {
        setResetPasswordUser(user);
        setResetPasswordValue("");
    }

    function closeResetPassword() {
        setResetPasswordUser(null);
        setResetPasswordValue("");
    }

    return {
        newUser,
        setNewUser,
        resetPasswordUser,
        resetPasswordValue,
        setResetPasswordValue,
        resetNewUserForm,
        openResetPassword,
        closeResetPassword
    };
}

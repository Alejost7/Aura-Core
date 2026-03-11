import Button from "../ui/Button";
import type { NuevoUsuarioInput, Usuario } from "../../hooks/useProducts";

interface UsersViewProps {
    isAdmin: boolean;
    isLoading: boolean;
    newUser: NuevoUsuarioInput;
    usuarios: Usuario[];
    onUsernameChange: (value: string) => void;
    onRolChange: (rol: "admin" | "vendedor") => void;
    onPasswordChange: (value: string) => void;
    onCreateUser: (e: React.FormEvent) => Promise<void>;
    onOpenResetPassword: (user: Usuario) => void;
    onDeactivateUser: (userId: number) => Promise<void>;
    onActivateUser: (userId: number) => Promise<void>;
}

export default function UsersView({
    isAdmin,
    isLoading,
    newUser,
    usuarios,
    onUsernameChange,
    onRolChange,
    onPasswordChange,
    onCreateUser,
    onOpenResetPassword,
    onDeactivateUser,
    onActivateUser
}: UsersViewProps) {
    if (!isAdmin) {
        return (
            <section className="beauty-glass rounded-2xl p-6">
                <p className="text-sm text-rose-100/70">No tienes permisos para gestionar usuarios.</p>
            </section>
        );
    }

    return (
        <section className="beauty-glass rounded-2xl p-6">
            <div className="space-y-6">
                <form onSubmit={onCreateUser} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input
                        value={newUser.username}
                        onChange={(e) => onUsernameChange(e.target.value)}
                        className="beauty-input rounded-xl px-3 py-2 text-sm"
                        placeholder="Usuario"
                        required
                    />
                    <select
                        value={newUser.rol}
                        onChange={(e) => onRolChange(e.target.value as "admin" | "vendedor")}
                        className="beauty-input rounded-xl px-3 py-2 text-sm"
                    >
                        <option value="vendedor">Vendedor</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        className="beauty-input rounded-xl px-3 py-2 text-sm"
                        placeholder="Password inicial"
                        required
                    />
                    <Button type="submit" variant="success" isLoading={isLoading}>Crear usuario</Button>
                </form>

                <div className="overflow-auto rounded-xl border border-rose-100/15">
                    <table className="w-full text-left">
                        <thead className="bg-rose-950/30 text-xs uppercase text-rose-100/70">
                            <tr>
                                <th className="px-4 py-3">Usuario</th>
                                <th className="px-4 py-3">Rol</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Ultimo login</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-100/10 text-sm">
                            {usuarios.map((u) => (
                                <tr key={u.id} className="hover:bg-rose-950/25">
                                    <td className="px-4 py-3 text-rose-50">{u.username}</td>
                                    <td className="px-4 py-3">{u.rol}</td>
                                    <td className="px-4 py-3">{u.activo === 1 ? "Activo" : "Inactivo"}</td>
                                    <td className="px-4 py-3">{u.last_login ?? "-"}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => onOpenResetPassword(u)}>Reset password</Button>
                                            {u.activo === 1 && (
                                                <Button size="sm" variant="danger" onClick={async () => onDeactivateUser(u.id)}>Desactivar</Button>
                                            )}
                                            {u.activo !== 1 && (
                                                <Button size="sm" variant="success" onClick={async () => onActivateUser(u.id)}>Activar</Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

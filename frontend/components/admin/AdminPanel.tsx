"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import type { User } from "@/types/user";
import type { Listing } from "@/types/listing";
import type { Claim, ClaimStatus } from "@/types/claim";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type TabKey = "overview" | "users" | "items" | "claims";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function formatDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

async function parseJsonSafe(res: Response) {
  return res.json().catch(() => null);
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Listing[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showSystemNotificationModal, setShowSystemNotificationModal] =
    useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [sendingSystemNotification, setSendingSystemNotification] =
    useState(false);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      localStorage.removeItem("access_token");
      window.location.replace("/login");
      throw new Error("Nedostaje token.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const handleUnauthorized = useCallback((res: Response) => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("access_token");
      window.location.replace("/login");
      return true;
    }

    return false;
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno učitavanje korisnika.");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri učitavanju korisnika."
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [authHeaders, handleUnauthorized]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/items`, {
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno učitavanje oglasa.");
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri učitavanju oglasa."
      );
    } finally {
      setLoadingItems(false);
    }
  }, [authHeaders, handleUnauthorized]);

  const fetchClaims = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/claims`, {
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno učitavanje claimova.");
      }

      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri učitavanju claimova."
      );
    } finally {
      setLoadingClaims(false);
    }
  }, [authHeaders, handleUnauthorized]);

  const reloadUsers = async () => {
    setMessage("");
    setError("");
    setLoadingUsers(true);
    await fetchUsers();
  };

  const reloadItems = async () => {
    setMessage("");
    setError("");
    setLoadingItems(true);
    await fetchItems();
  };

  const reloadClaims = async () => {
    setMessage("");
    setError("");
    setLoadingClaims(true);
    await fetchClaims();
  };

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setError("");
      await Promise.all([fetchUsers(), fetchItems(), fetchClaims()]);
    };

    if (!cancelled) {
      loadAll();
    }

    return () => {
      cancelled = true;
    };
  }, [fetchUsers, fetchItems, fetchClaims]);

  const overview = useMemo(() => {
    const activeUsers = users.filter((user) => user.is_active).length;
    const adminUsers = users.filter((user) => user.is_admin).length;
    const activeItems = items.filter((item) => item.status === "active").length;
    const pendingClaims = claims.filter(
      (claim) => claim.status === "pending"
    ).length;

    return {
      totalUsers: users.length,
      activeUsers,
      adminUsers,
      totalItems: items.length,
      activeItems,
      totalClaims: claims.length,
      pendingClaims,
    };
  }, [users, items, claims]);

  const handleToggleUserActive = async (user: User) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          is_active: !user.is_active,
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno ažuriranje korisnika.");
      }

      setUsers((prev) =>
        prev.map((entry) => (entry.id === user.id ? data : entry))
      );
      setMessage("Status korisnika je uspješno ažuriran.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri ažuriranju korisnika."
      );
    }
  };

  const handleToggleUserAdmin = async (user: User) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          is_admin: !user.is_admin,
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          data?.detail || "Neuspješna promjena admin privilegija."
        );
      }

      setUsers((prev) =>
        prev.map((entry) => (entry.id === user.id ? data : entry))
      );
      setMessage("Admin privilegije su uspješno ažurirane.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri ažuriranju admin privilegija."
      );
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmed = window.confirm(
      "Da li sigurno želiš obrisati korisnika? Ovo briše i njegove oglase."
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const data = await parseJsonSafe(res);
        throw new Error(data?.detail || "Neuspješno brisanje korisnika.");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setItems((prev) => prev.filter((item) => item.user_id !== userId));
      setClaims((prev) => prev.filter((claim) => claim.user_id !== userId));
      setMessage("Korisnik je uspješno obrisan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri brisanju korisnika."
      );
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const confirmed = window.confirm("Da li sigurno želiš obrisati oglas?");

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/items/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const data = await parseJsonSafe(res);
        throw new Error(data?.detail || "Neuspješno brisanje oglasa.");
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setClaims((prev) => prev.filter((claim) => claim.item_id !== itemId));
      setMessage("Oglas je uspješno obrisan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri brisanju oglasa."
      );
    }
  };

  const handleDeleteClaim = async (claimId: number) => {
    const confirmed = window.confirm("Da li sigurno želiš obrisati claim?");

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/claims/${claimId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const data = await parseJsonSafe(res);
        throw new Error(data?.detail || "Neuspješno brisanje claima.");
      }

      setClaims((prev) => prev.filter((claim) => claim.id !== claimId));
      setMessage("Claim je uspješno obrisan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri brisanju claima."
      );
    }
  };

  const handleUpdateClaimStatus = async (
    claimId: number,
    nextStatus: ClaimStatus
  ) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/claims/${claimId}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješna promjena statusa claima.");
      }

      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === claimId ? { ...claim, ...data } : claim
        )
      );
      setMessage("Status claima je uspješno ažuriran.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri promjeni statusa claima."
      );
    }
  };

  const handleSendSystemNotification = async () => {
    setMessage("");
    setError("");

    if (!notificationTitle.trim() || !notificationBody.trim()) {
      setError("Popuni naslov i poruku.");
      return;
    }

    try {
      setSendingSystemNotification(true);

      const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: notificationTitle.trim(),
          body: notificationBody.trim(),
          data: {
            source: "admin_panel_broadcast",
          },
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          data?.detail || "Neuspješno slanje sistemske notifikacije."
        );
      }

      setNotificationTitle("");
      setNotificationBody("");
      setShowSystemNotificationModal(false);
      setMessage(
        data?.message ||
          "Sistemska notifikacija je uspješno poslana svim aktivnim korisnicima."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri slanju sistemske notifikacije."
      );
    } finally {
      setSendingSystemNotification(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 1400, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Hero section */}
      <Card sx={{ bgcolor: "background.paper" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: "text.secondary",
                  display: "block",
                  lineHeight: 1.5,
                }}
              >
                Admin panel
              </Typography>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  mt: 0.5,
                  letterSpacing: "-0.02em",
                }}
              >
                Administracija
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: "60ch" }}>
                Upravljaj korisnicima, oglasima i claimovima sa jednog mjesta.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowSystemNotificationModal(true)}
              sx={{ py: 1.2, px: 3, alignSelf: { xs: "stretch", sm: "auto" } }}
            >
              Pošalji sistemsku notifikaciju
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={showSystemNotificationModal}
        onClose={() => setShowSystemNotificationModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800 }}>
          Nova sistemska notifikacija
          <IconButton size="small" onClick={() => setShowSystemNotificationModal(false)}>
            <FontAwesomeIcon icon={faXmark} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          <TextField
            label="Naslov"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            placeholder="Unesi naslov notifikacije"
            fullWidth
            required
          />

          <TextField
            label="Poruka"
            value={notificationBody}
            onChange={(e) => setNotificationBody(e.target.value)}
            placeholder="Unesi tekst poruke"
            multiline
            rows={4}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button color="secondary" onClick={() => setShowSystemNotificationModal(false)}>
            Odustani
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendSystemNotification}
            disabled={sendingSystemNotification}
          >
            {sendingSystemNotification ? "Slanje..." : "Pošalji"}
          </Button>
        </DialogActions>
      </Dialog>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
          aria-label="admin tabs"
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Pregled" value="overview" sx={{ fontWeight: 700 }} />
          <Tab label="Korisnici" value="users" sx={{ fontWeight: 700 }} />
          <Tab label="Oglasi" value="items" sx={{ fontWeight: 700 }} />
          <Tab label="Claimovi" value="claims" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {activeTab === "overview" && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Ukupno korisnika
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "text.primary" }}>
                  {overview.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Aktivni korisnici
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "text.primary" }}>
                  {overview.activeUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Admin korisnici
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "text.primary" }}>
                  {overview.adminUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Ukupno oglasa
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "text.primary" }}>
                  {overview.totalItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Aktivni oglasi
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "text.primary" }}>
                  {overview.activeItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Pending claimovi
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "text.primary" }}>
                  {overview.pendingClaims}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === "users" && (
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
                Korisnici
              </Typography>
              <Button variant="outlined" color="primary" onClick={reloadUsers} disabled={loadingUsers}>
                Osvježi
              </Button>
            </Stack>

            {loadingUsers ? (
              <Stack direction="row" spacing={2} sx={{ py: 4, alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">Učitavanje korisnika...</Typography>
              </Stack>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Korisnik</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Admin</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Akcije</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          <Stack spacing={0.2}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {user.first_name} {user.last_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{user.username}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.is_active ? "Aktivan" : "Neaktivan"}</TableCell>
                        <TableCell>{user.is_admin ? "Da" : "Ne"}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleToggleUserActive(user)}
                            >
                              {user.is_active ? "Deaktiviraj" : "Aktiviraj"}
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleToggleUserAdmin(user)}
                            >
                              {user.is_admin ? "Ukloni admin" : "Postavi admin"}
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Obriši
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Nema korisnika za prikaz.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "items" && (
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
                Oglasi
              </Typography>
              <Button variant="outlined" color="primary" onClick={reloadItems} disabled={loadingItems}>
                Osvježi
              </Button>
            </Stack>

            {loadingItems ? (
              <Stack direction="row" spacing={2} sx={{ py: 4, alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">Učitavanje oglasa...</Typography>
              </Stack>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Naslov</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tip</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Lokacija</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Datum</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Akcije</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>
                          <Stack spacing={0.2}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.category}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>{item.item_type}</TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>{item.status}</TableCell>
                        <TableCell>{item.location_name}</TableCell>
                        <TableCell>{formatDate(item.event_date)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              component="a"
                              href={`/AllItems/${item.id}`}
                            >
                              Otvori
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              Obriši
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">Nema oglasa za prikaz.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "claims" && (
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
                Claimovi
              </Typography>
              <Button variant="outlined" color="primary" onClick={reloadClaims} disabled={loadingClaims}>
                Osvježi
              </Button>
            </Stack>

            {loadingClaims ? (
              <Stack direction="row" spacing={2} sx={{ py: 4, alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="text.secondary">Učitavanje claimova...</Typography>
              </Stack>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Korisnik</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Oglas</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Poruka</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Akcije</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id} hover>
                        <TableCell>{claim.id}</TableCell>
                        <TableCell>{claim.user?.username || claim.user_id}</TableCell>
                        <TableCell>{claim.item?.title || claim.item_id}</TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>{claim.status}</TableCell>
                        <TableCell sx={{ maxWidth: 300, whiteSpace: "normal", color: "text.secondary" }}>
                          {claim.message}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() =>
                                handleUpdateClaimStatus(claim.id, "accepted")
                              }
                            >
                              Prihvati
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() =>
                                handleUpdateClaimStatus(claim.id, "rejected")
                              }
                            >
                              Odbij
                            </Button>

                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteClaim(claim.id)}
                            >
                              Obriši
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                    {claims.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">Nema claimova za prikaz.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
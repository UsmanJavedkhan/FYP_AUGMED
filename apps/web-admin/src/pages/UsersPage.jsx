// page that combines the team directory + invite form

import { useEffect, useState } from 'react'

import { createUser, deleteUser, fetchUsers, updateUser } from '../api'
import UserDirectory from '../components/UserDirectory'
import InviteForm from '../components/InviteForm'

function UsersPage({ currentUserId }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState(null)

  // load list of users from api
  async function reload() {
    try {
      setLoading(true)
      setUsers(await fetchUsers())
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  // handlers passed down to children
  async function handleCreate(payload) {
    await createUser(payload)
    await reload()
  }

  async function handleToggleActive(user) {
    try {
      await updateUser(user.id, { is_active: !user.is_active })
      await reload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to update user.')
    }
  }

  async function handleChangeRole(user, role) {
    try {
      await updateUser(user.id, { role })
      await reload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to update role.')
    }
  }

  // save edited name / email; returns true so the row can exit edit mode
  async function handleSaveProfile(user, changes) {
    setErrMsg(null)
    try {
      await updateUser(user.id, changes)
      await reload()
      return true
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to update user.')
      return false
    }
  }

  async function handleDelete(user) {
    if (user.id === currentUserId) return
    if (!confirm(`Delete ${user.email}?`)) return
    try {
      await deleteUser(user.id)
      await reload()
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to delete user.')
    }
  }

  return (
    <>
      {errMsg ? (
        <div className="px-4 py-3.5 rounded-[14px] bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.22)] text-[#b91c1c] text-[0.9rem]">
          {errMsg}
        </div>
      ) : null}

      <section className="grid grid-cols-[1.4fr_1fr] gap-5 max-[1080px]:grid-cols-1">
        <UserDirectory
          users={users}
          loading={loading}
          currentUserId={currentUserId}
          onReload={() => void reload()}
          onChangeRole={handleChangeRole}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
          onSaveProfile={handleSaveProfile}
        />
        <InviteForm onCreate={handleCreate} />
      </section>
    </>
  )
}

export default UsersPage

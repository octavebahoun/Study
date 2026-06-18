import api from './api';
import toast from 'react-hot-toast';

const BADGES_DEF = [
  { id: "first_note", icon: "📝", name: "Première note" },
  { id: "perfect", icon: "⭐", name: "Perfection" },
  { id: "target_hit", icon: "🎯", name: "Objectif atteint" },
  { id: "semester_done", icon: "🏅", name: "Semestre validé" },
  { id: "streak", icon: "🔥", name: "En feu" },
];

export async function checkAndToastNewBadges(currentUser, updateUser) {
  try {
    const res = await api.get('/user/me');
    const newUser = res.data;
    const oldBadges = currentUser?.badges || [];
    const newBadges = newUser?.badges || [];

    if (newBadges.length > oldBadges.length) {
      const added = newBadges.filter(nb => !oldBadges.some(ob => ob.id === nb.id));
      added.forEach(b => {
        const badgeDef = BADGES_DEF.find(bd => bd.id === b.id);
        if (badgeDef) {
          toast.success(`Nouveau badge débloqué : ${badgeDef.icon} ${badgeDef.name} ! 🎉`, {
            duration: 6000,
            icon: badgeDef.icon
          });
        }
      });
    }
    updateUser(newUser);
  } catch (err) {
    console.error("Error syncing badges:", err);
  }
}

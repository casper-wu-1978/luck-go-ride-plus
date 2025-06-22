
import { useState } from "react";
import { FavoriteCode, FavoriteAddress } from "@/types/callCar";
import { loadFavorites } from "@/utils/callCarApi";

export const useFavorites = () => {
  const [favoriteCodes, setFavoriteCodes] = useState<FavoriteCode[]>([]);
  const [favoriteAddresses, setFavoriteAddresses] = useState<FavoriteAddress[]>([]);

  const loadUserFavorites = async (lineUserId: string) => {
    const { codes, addresses } = await loadFavorites(lineUserId);
    setFavoriteCodes(codes);
    setFavoriteAddresses(addresses);
  };

  return {
    favoriteCodes,
    favoriteAddresses,
    loadUserFavorites,
  };
};

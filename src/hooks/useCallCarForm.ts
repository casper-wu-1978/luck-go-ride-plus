
import { useState } from "react";

export const useCallCarForm = () => {
  const [carType, setCarType] = useState("unlimited");
  const [favoriteType, setFavoriteType] = useState("none");
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedAddressName, setSelectedAddressName] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  const resetForm = () => {
    setCarType("unlimited");
    setFavoriteType("none");
    setSelectedCode("");
    setSelectedAddressName("");
    setSelectedAddress("");
  };

  return {
    carType,
    favoriteType,
    selectedCode,
    selectedAddressName,
    selectedAddress,
    setCarType,
    setFavoriteType,
    setSelectedCode,
    setSelectedAddressName,
    setSelectedAddress,
    resetForm,
  };
};

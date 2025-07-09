"use client";
import { useState, useCallback } from "react";

export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isOpenPassword, setIsOpenPassword] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const openPasswordModal = useCallback(() => setIsOpenPassword(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);
  const closePassModal = useCallback(() => setIsOpenPassword(false),[]);

  return { isOpen, openModal, closeModal, toggleModal,closePassModal,openPasswordModal,isOpenPassword };
};

import Swal from "sweetalert2";

const baseCustomClass = {
  popup: "swal-alert-popup",
  title: "swal-alert-title",
  htmlContainer: "swal-alert-text",
  confirmButton: "swal-alert-confirm",
  cancelButton: "swal-alert-cancel",
};

export const showSuccess = async (title, text = "", timer = 1500) =>
  await Swal.fire({
    icon: "success",
    title,
    text,
    timer,
    showConfirmButton: false,
    toast: false,
    customClass: baseCustomClass,
    backdrop: true,
  });

export const showError = async (title, text = "Something went wrong") =>
  await Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "Okay",
    customClass: baseCustomClass,
    backdrop: true,
  });

export const showWarning = async (
  title,
  text,
  confirmButtonText = "Continue",
  cancelButtonText = "Cancel"
) =>
  await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: baseCustomClass,
    reverseButtons: true,
    backdrop: true,
  });

export const showToast = async (title, icon = "success", timer = 1500) =>
  await Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
    customClass: {
      popup: "swal-alert-toast",
      title: "swal-alert-toast-title",
    },
  });

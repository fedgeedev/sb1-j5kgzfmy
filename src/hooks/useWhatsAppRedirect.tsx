import { Therapist } from '../types';

const useWhatsAppRedirect = () => {
  const redirectToWhatsApp = (therapist: Therapist) => {
    const phoneNumber = therapist.phoneNumber.replace(/[^0-9]/g, '');
    
    // Create the pre-filled message
    const message = `Hi ${therapist.name.split(' ')[0]}! 👋 I just found your profile on TheraWay and I would love to schedule a consultation. Please let me know how we can get started. Thanks! 🌿`;
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create the WhatsApp URL
    const whatsAppUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsAppUrl, '_blank');
  };
  
  return { redirectToWhatsApp };
};

export default useWhatsAppRedirect;
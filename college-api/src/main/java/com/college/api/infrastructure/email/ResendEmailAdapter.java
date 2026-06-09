package com.college.api.infrastructure.email;

import com.college.api.domain.email.EmailPort;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;

public class ResendEmailAdapter implements EmailPort {

    private final Resend resend;
    private final String fromEmail;

    public ResendEmailAdapter(String apiKey, String fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendSetPasswordEmail(String toEmail, String username, String setPasswordUrl) {
        send(toEmail,
                "Defina sua senha - Portal Universitário",
                """
                Olá, %s!

                Sua conta foi criada no Portal Universitário.
                Por favor, acesse o link abaixo para criar sua senha:

                %s

                Este link é válido por 24 horas. Após esse prazo será necessário solicitar um novo link ao administrador.

                Atenciosamente,
                Portal Universitário
                """.formatted(username, setPasswordUrl));
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String username, String resetUrl) {
        send(toEmail,
                "Redefinição de senha - Portal Universitário",
                """
                Olá, %s!

                Recebemos uma solicitação para redefinir a senha da sua conta no Portal Universitário.
                Acesse o link abaixo para escolher uma nova senha:

                %s

                Este link é válido por 24 horas. Caso não tenha solicitado a redefinição, ignore este e-mail.

                Atenciosamente,
                Portal Universitário
                """.formatted(username, resetUrl));
    }

    @Override
    public void sendNoticeNotificationEmail(String toEmail, String username, String noticeTitle,
            String categoryName, String noticeUrl, String preferencesUrl) {
        send(toEmail,
                "Novo aviso: %s - Portal Universitário".formatted(noticeTitle),
                """
                Olá, %s!

                Um novo aviso foi publicado na categoria "%s":

                %s

                Acesse o aviso pelo link abaixo:
                %s

                Se não quiser mais receber notificações desta categoria, acesse suas preferências:
                %s

                Atenciosamente,
                Portal Universitário
                """.formatted(username, categoryName, noticeTitle, noticeUrl, preferencesUrl));
    }

    private void send(String toEmail, String subject, String body) {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(toEmail)
                .subject(subject)
                .text(body)
                .build();
        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            throw new RuntimeException("Failed to send email via Resend", e);
        }
    }
}

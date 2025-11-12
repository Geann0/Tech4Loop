# Guia de Configuração do Storage (Supabase)

Para que os parceiros possam fazer upload das imagens dos produtos, precisamos configurar o "Storage" do Supabase.

## Passo 1: Criar o Bucket de Imagens

1.  Acesse seu projeto no [Supabase](https://supabase.com/).
2.  No menu lateral esquerdo, clique no ícone de **Storage** (parece um balde).
3.  Clique em **"New bucket"**.
4.  No campo "Name", digite **exatamente** `product_images`.
5.  **Importante:** Marque a opção **"Public bucket"**. Isso permite que as imagens sejam visualizadas no site.
6.  Clique em **"Create bucket"**.

## Passo 2: Configurar Políticas de Segurança para Uploads

Agora, vamos criar regras para garantir que um parceiro só possa gerenciar imagens na sua própria pasta. Como o template pode não estar disponível, vamos criar as políticas manualmente.

1.  Ainda na tela de **Storage**, clique nos três pontos (`...`) ao lado do bucket `product_images` e selecione **"Policies"**.
2.  **APAGUE AS POLÍTICAS ANTIGAS** se elas existirem.
3.  Clique em **"+ New policy"** e selecione **"Create a policy from scratch"**.
4.  **Crie as 4 políticas a seguir, uma de cada vez:**

    ***

    **1. Política para VISUALIZAR (SELECT)**

    - **Policy name:** `Partners can view their own images.`
    - **Allowed operation:** Marque apenas `SELECT`.
    - **USING expression:** Cole o seguinte código:
      ```sql
      (bucket_id = 'product_images' AND (storage.foldername(name))[1] = (auth.uid())::text)
      ```
    - Clique em **"Review"** e depois em **"Save policy"**.

    ***

    **2. Política para CRIAR (INSERT) - CORRIGIDA**

    - Clique em **"+ New policy"** novamente.
    - **Policy name:** `Partners can upload to their own folder.`
    - **Allowed operation:** Marque apenas `INSERT`.
    - **WITH CHECK expression:** Cole o seguinte código (note que é `WITH CHECK`):
      ```sql
      (bucket_id = 'product_images' AND (storage.foldername(name))[1] = (auth.uid())::text)
      ```
    - Clique em **"Review"** e depois em **"Save policy"**.

    ***

    **3. Política para ATUALIZAR (UPDATE) - CORRIGIDA**

    - Clique em **"+ New policy"** novamente.
    - **Policy name:** `Partners can update their own images.`
    - **Allowed operation:** Marque apenas `UPDATE`.
    - **USING expression:** Cole o seguinte código:
      ```sql
      (bucket_id = 'product_images' AND (storage.foldername(name))[1] = (auth.uid())::text)
      ```
    - **WITH CHECK expression:** Cole o mesmo código acima.
    - Clique em **"Review"** e depois em **"Save policy"**.

    ***

    **4. Política para DELETAR (DELETE)**

    - Clique em **"+ New policy"** novamente.
    - **Policy name:** `Partners can delete their own images.`
    - **Allowed operation:** Marque apenas `DELETE`.
    - **USING expression:** Cole o seguinte código:
      ```sql
      (bucket_id = 'product_images' AND (storage.foldername(name))[1] = (auth.uid())::text)
      ```
    - Clique em **"Review"** e depois em **"Save policy"**.

Isso é tudo! As regras agora garantem que cada usuário (parceiro) só possa gerenciar arquivos dentro de uma pasta com o seu próprio ID de usuário. O código da aplicação já está preparado para usar essa estrutura de pastas.

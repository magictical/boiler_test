import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { getServiceRoleClient } from '@/lib/supabase/service-role'

/**
 * Clerk 웹훅 핸들러
 *
 * Clerk에서 발생하는 이벤트를 처리하여 Supabase와 동기화합니다.
 * - user.deleted: Clerk에서 사용자가 삭제되면 Supabase에서도 삭제
 */
export async function POST(req: Request) {
  try {
    // Clerk 웹훅 시크릿 키 확인 (환경 변수에서 가져와야 함)
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!CLERK_WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET is not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    // 요청 헤더에서 Svix 헤더 추출
    const headersList = await headers()
    const svix_id = headersList.get('svix-id')
    const svix_timestamp = headersList.get('svix-timestamp')
    const svix_signature = headersList.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Missing Svix headers', { status: 400 })
    }

    // 요청 바디를 텍스트로 읽기
    const body = await req.text()

    // 웹훅 검증
    const wh = new Webhook(CLERK_WEBHOOK_SECRET)
    let evt: WebhookEvent

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent
    } catch (err) {
      console.error('Webhook verification failed:', err)
      return new Response('Webhook verification failed', { status: 400 })
    }

    // 이벤트 타입에 따른 처리
    const eventType = evt.type
    console.log(`Received Clerk webhook: ${eventType}`)

    const supabase = getServiceRoleClient()

    switch (eventType) {
      case 'user.deleted': {
        const clerkUserId = evt.data.id

        // Supabase에서 해당 사용자 삭제
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('clerk_id', clerkUserId)

        if (error) {
          console.error('Failed to delete user from Supabase:', error)
          return new Response('Failed to delete user', { status: 500 })
        }

        console.log(`User ${clerkUserId} deleted from Supabase`)
        break
      }

      case 'user.created': {
        // 이미 로그인 시 동기화되므로 추가 처리 불필요
        console.log(`User ${evt.data.id} created in Clerk`)
        break
      }

      case 'user.updated': {
        // 필요시 업데이트 로직 추가
        console.log(`User ${evt.data.id} updated in Clerk`)
        break
      }

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return new Response('Webhook processed successfully', { status: 200 })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

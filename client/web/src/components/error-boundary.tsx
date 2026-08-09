import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  info: ErrorInfo | null
}

/** 全局错误边界：渲染崩溃不白屏，展示错误信息并可重试 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info })
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ error: null, info: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="size-5" />
              页面渲染出错
            </CardTitle>
            <CardDescription>界面异常已被捕获，可尝试刷新恢复；若持续出现请反馈。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs">
              {String(this.state.error.message || this.state.error)}
              {this.state.info?.componentStack && (
                <span className="mt-2 block text-muted-foreground">{this.state.info.componentStack}</span>
              )}
            </pre>
            <Button onClick={this.reset}>
              <RotateCcw className="size-4" /> 重试
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
